# -*- coding: utf-8 -*-
from django.contrib import admin
from links.models import Link, LinkProfile


class LinkDataInline(admin.TabularInline):
    model = LinkProfile


class LinkAdmin(admin.ModelAdmin):
    inlines = [LinkDataInline]

admin.site.register(Link, LinkAdmin)
