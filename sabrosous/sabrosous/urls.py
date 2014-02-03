from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.contrib.auth.decorators import login_required

from .views import HomeView, DashboardView
from links.views import (
    LinkProfileList,
    LinkProfileDetail, LinkImportView
)


APIV1_BASE_URL = 'api/'
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', HomeView.as_view(), name='home'),
    url(r'^dashboard/$', DashboardView.as_view(), name='dashboard'),
    (r'^browserid/', include('django_browserid.urls')),
    url(r'^import/$', login_required(LinkImportView.as_view()), name='file_import'),
    url(r'^%slinks/$' % APIV1_BASE_URL, LinkProfileList.as_view()),
    url(r'^%slinks/(?P<pk>[0-9]+)/$' % APIV1_BASE_URL,
        LinkProfileDetail.as_view()),
    url(r'^api-auth/', include('rest_framework.urls',
        namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls)),
)
