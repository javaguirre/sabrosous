from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.contrib.auth.decorators import login_required

from .views import HomeView, DashboardView
from links.views import (
    LinkProfileList,
    LinkProfileDetail, LinkImportView,
    LinkSave
)


APIV1_BASE_URL = 'api/'
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', HomeView.as_view(), name='home'),
    url(r'^dashboard/$', login_required(DashboardView.as_view()), name='dashboard'),
    (r'^browserid/', include('django_browserid.urls')),
    url(r'^import/$', login_required(LinkImportView.as_view()), name='file_import'),
    url(r'^save/$', login_required(LinkSave.as_view()), name='save'),
    url(r'^%slinks/$' % APIV1_BASE_URL, login_required(LinkProfileList.as_view())),
    url(r'^%slinks/(?P<pk>[0-9]+)/$' % APIV1_BASE_URL,
        login_required(LinkProfileDetail.as_view())),
    url(r'^api-auth/', include('rest_framework.urls',
        namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls)),
)
