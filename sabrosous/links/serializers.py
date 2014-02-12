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

    def set_tags(self):
        new_tags = self.init_data.getlist('tags[]')
        old_tags = self.object.tags.slugs()
        to_be_removed = [old_tag for old_tag in old_tags if old_tag not in new_tags]
        to_be_added = [new_tag for new_tag in new_tags if new_tag not in old_tags]

        if to_be_removed:
            self.object.tags.remove(*to_be_removed)
        if to_be_added:
            self.object.tags.add(*to_be_added)

    def save(self, **kwargs):
        # Clear cached _data, which may be invalidated by `save()`
        self._data = None

        if isinstance(self.object, list):
            [self.save_object(item, **kwargs) for item in self.object]

            if self.object._deleted:
                [self.delete_object(item) for item in self.object._deleted]
        else:
            self.set_tags()
            self.save_object(self.object, **kwargs)

        return self.object
