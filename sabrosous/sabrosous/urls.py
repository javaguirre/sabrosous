from django.conf.urls import patterns, include, url

from django.contrib import admin

from .views import HomeView, DashboardView


admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', HomeView.as_view(), name='home'),
    url(r'^dashboard/$', DashboardView.as_view(), name='dashboard'),
    (r'^browserid/', include('django_browserid.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
