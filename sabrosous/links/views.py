import json

from django.shortcuts import redirect
from django.views.generic.base import TemplateView
from django.http import HttpResponse
from django.contrib import messages
from rest_framework import generics, mixins, status
from rest_framework.response import Response
from rest_framework import permissions

from links.serializers import LinkSerializer, LinkProfileSerializer
from links.models import Link, LinkProfile
from links.utils import import_links, handle_query


class LinkSave(TemplateView):
    def get(self, request):
        url = request.GET.get('url', None)
        serializer = LinkSerializer(data=request.GET)
        linkprofile = Link.objects.save_link(serializer, url,
                                             request.user)

        if not linkprofile:
            message = 'You need to add an url'
            messages.error(request, message)
        else:
            message = 'Url saved'
            messages.info(request, message)

        return redirect('home')


class LinkProfileList(mixins.ListModelMixin,
                      mixins.CreateModelMixin,
                      generics.MultipleObjectAPIView):
    serializer_class = LinkProfileSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def get_queryset(self):
        LIMIT = 20
        query = self.request.GET.get('query', None)

        if not query:
            queryset = self.request.user.linkprofile_set.all()
        else:
            queryset = self.request.user.linkprofile_set.filter(handle_query(query))

        return queryset.distinct().order_by('-pub_date')[:LIMIT]

    def post(self, request, *args, **kwargs):
        serializer = LinkSerializer(data=request.DATA)
        linkprofile = Link.objects.save_link(serializer, request.DATA['url'],
                                             request.user)

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
