import json

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.views.generic.base import TemplateView
from django.http import HttpResponse
from rest_framework import generics, mixins, status
from rest_framework.response import Response
from rest_framework import permissions

from links.serializers import LinkSerializer, LinkProfileSerializer
from links.models import Link, LinkProfile
from links.utils import import_links, handle_query


class LinkIndex(TemplateView):
    def get(self, request):
        return render_to_response('links/index.html',
                                  context_instance=RequestContext(request))

    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(LinkIndex, self).dispatch(*args, **kwargs)


class LinkProfileList(mixins.ListModelMixin,
                      mixins.CreateModelMixin,
                      generics.MultipleObjectAPIView):
    serializer_class = LinkProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def get_queryset(self):
        query = self.request.GET.get('query', None)

        if not query:
            queryset = self.request.user.linkprofile_set.all()
        else:
            queryset = self.request.user.linkprofile_set.filter(handle_query(query))

        return queryset.distinct().order_by('-pub_date')

    def post(self, request, *args, **kwargs):
        serializer = LinkSerializer(data=request.DATA)
        set_profile = False

        try:
            existing_link = Link.objects.get(url=request.DATA['url'])
        except Link.DoesNotExist:
            existing_link = None

        if not existing_link and serializer.is_valid():
            obj = serializer.save()
            obj.save()
            set_profile = True
        elif existing_link:
            obj = existing_link
            set_profile = True

        if set_profile:
            linkprofile = obj.set_linkprofile(request.user)
            if linkprofile:
                return Response(LinkProfileSerializer(linkprofile).data,
                                status=status.HTTP_201_CREATED)
        return Response(serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST)


class LinkProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    model = LinkProfile
    serializer_class = LinkProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)


class LinkImportView(TemplateView):
    def post(self, request):
        links = import_links(request.FILES['file'], request.user)
        Link.objects.set_from_links(links, request.user)

        response_data = {'status': 'ok',
                         'message': 'Good!'}
        return HttpResponse(json.dumps(response_data),
                            mimetype='application/json')
