import re

from lxml import html
import requests
from requests.exceptions import ConnectionError


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
