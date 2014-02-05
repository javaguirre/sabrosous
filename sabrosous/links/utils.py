import re
import operator
from functools import reduce
from collections import defaultdict

from lxml import html
import requests
from requests.exceptions import ConnectionError
from django.db.models import Q


def is_local_url(url):
    regex = "^(http|https):\/\/(127\.0\.0\.1|sabrosous\.net|localhost)"
    return re.match(regex, url)


def get_url_content(url):
    try:
        response = requests.get(url, timeout=3)
    except ConnectionError:
        return False

    if response.status_code == 200 and not is_local_url(url):
        return response.content
    else:
        return False


def get_metas(content, result):
    metas = content.findall("head/meta")
    for meta in metas:
        if meta.get('name') == 'description':
            result['description'] = unicode(meta.get('content'))
        elif meta.get("name") == 'keywords':
            result['tags'] = unicode(meta.get('content'))
    return result


def scrap_url(url):
    url_content = get_url_content(url)
    result = {'title': '', 'description': '', 'tags': ''}

    if url_content:
        try:
            content = html.document_fromstring(url_content)
        except ValueError:
            return result

        title = content.find("head/title")
        if title is not None:
            result['title'] = title.text
        result = get_metas(content, result)

    return result


def parse_delicious(html_data):
    favs = html.document_fromstring(html_data)
    links_list = []

    for fav in favs.iterlinks():
        link_obj = {"title": fav[0].text,
                    "url": fav[0].get("href"),
                    "tags": fav[0].get("tags"),
                    "date": fav[0].get("add_date")
                    }
        links_list.append(link_obj)

    return links_list


def import_links(import_file, user):
    content = import_file.read()
    links = parse_delicious(content)

    return links


def handle_query(query):
    query_tokens = defaultdict(list)
    query_result = None
    tokens = query.split(' ')

    for token in tokens:
        if token.startswith('#'):
            query_tokens['tags'].append(token[1:])
        else:
            query_tokens['titles'].append(token)

    if query_tokens['titles']:
        query_tokens['titles'] = reduce(operator.and_, (Q(title__icontains=x) for x in query_tokens['titles']))
        query_result = query_tokens['titles']
    if query_tokens['tags']:
        query_tokens['tags'] = Q(tags__slug__in=query_tokens['tags'])

        if query_result:
            query_result &= query_tokens['tags']
        else:
            query_result = query_tokens['tags']

    return query_result
