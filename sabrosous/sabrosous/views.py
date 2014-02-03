from django.views.generic import TemplateView
from django.shortcuts import redirect


class HomeView(TemplateView):
    template_name = 'index.html'

    def get(self, request, **kwargs):
        if request.user.is_authenticated():
            return redirect('dashboard')

        context = {}

        return self.render_to_response(context)


class DashboardView(TemplateView):
    template_name = 'dashboard.html'

    def get(self, request, **kwargs):
        context = {}

        return self.render_to_response(context)
