from __future__ import with_statement
from fabric.api import *


prod_server = 'do'


def prod():
    env.use_ssh_config = True
    env.hosts = [prod_server]
    env.root = '/home/javaguirre/sabrosous'
    env.project = '%s/%s' % (env.root, 'sabrosous')
    env.directory = '%s/sabrosous' % env.root
    env.activate = 'source %s/env/bin/activate' % env.root
    env.gunicorn = 'sabrosous'


def virtualenv(command):
    with cd(env.directory):
        run(env.activate + ' && ' + command)


def git_pull():
    """Updates the repository."""
    with cd(env.root):
        run('git pull origin master')


def install_static():
    with cd(env.root):
        run('bower install')


def compile_react():
    with cd(env.directory):
        run('jsx static/js/components static/js/build')


def restart_daemon():
    with cd(env.directory):
        run("sudo supervisorctl restart %s" % env.gunicorn)


def deploy():
    """Run the actual deployment steps: $ fab prod deploy"""
    with cd(env.directory):
        compile_react()
        install_static()
        git_pull()
        virtualenv("pip install -r %s/requirements.txt" % env.root)
        virtualenv("python manage.py syncdb")
        virtualenv("python manage.py migrate")
        virtualenv("python manage.py collectstatic")
    restart_daemon()
