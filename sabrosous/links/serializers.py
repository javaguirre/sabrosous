from rest_framework import serializers
from links.models import Link, LinkProfile

from taggit.models import Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('name', 'slug')


class LinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Link
        fields = ('id', 'url')


class LinkProfileSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, required=False)
    url = serializers.Field(source='url')

    class Meta:
        model = LinkProfile
        fields = ('id', 'title', 'user', 'description',
                  'pub_date', 'tags', 'link', 'url')
