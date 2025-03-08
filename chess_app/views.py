from django.shortcuts import render

def home(request):
    return render(request, 'chess_app/index.html')
