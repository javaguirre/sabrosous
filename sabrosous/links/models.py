import datetime

from django.db import models
from django.contrib.auth.models import User

from taggit.managers import TaggableManager

import utils


class LinkManager(models.Manager):
    def set_from_links(self, links, user):
        for link in links:
            link_saved = self.get_or_create(url=link['url'])
            pub_date = datetime.datetime.fromtimestamp(int(link['date']))
            import pdb; pdb.set_trace()
            link_profile = LinkProfile.objects.get_or_create(
                    user=user, link=link_saved,
                    title=link['title'],
                    pub_date=pub_date
            )
            link_profile.tags.add(
                    *[tag for tag in link['tags'].split(',')]
            )


class Link(models.Model):
    url = models.URLField(max_length=250, unique=True)

    objects = LinkManager()

    def __unicode__(self):
        return self.url

    def scrap_url(self):
        link_data = utils.scrap_url(self.url)

        return link_data

    def set_linkprofile(self, user):
        if not self.linkprofile_set.filter(user=user):
            link_data = self.scrap_url()
            linkprofile = self.linkprofile_set.create(title=link_data['title'],
                                                      description=link_data['description'],
                                                      user=user
                                                      )
            linkprofile.set_tags(link_data['tags'])
            return linkprofile
        else:
            return False


class LinkProfile(models.Model):
    DEFAULT_NUMBER_TAGS = 4

    link = models.ForeignKey(Link)
    user = models.ForeignKey(User)
    title = models.CharField(
            max_length=250,
            help_text='Maximum 250 Characters',
            blank=True,
            null=True,
            default='')
    description = models.TextField(
            blank=True,
            null=True,
            default=''
    )
    pub_date = models.DateTimeField(default=datetime.datetime.now)

    tags = TaggableManager()

    class Meta:
        ordering = ['-pub_date']

    def __unicode__(self):
        return self.title

    def url(self):
        return self.link.url

    def set_tags(self, value):
        tags = map(lambda x: x.strip(), value.split(','))
        if len(tags) > self.DEFAULT_NUMBER_TAGS:
            tags = tags[0:self.DEFAULT_NUMBER_TAGS]
        self.tags.add(*tags)

    def set_scraped_data(self, data):
        for key, value in data.items():
            if key != 'tags':
                setattr(self, key, value)
            else:
                self.set_tags(value)
