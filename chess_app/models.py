from django.db import models

class ChessPieceRule(models.Model):
    piece_name = models.CharField(max_length=50, unique=True)
    movement_rules = models.JSONField()  # Store movement rules as JSON

    def __str__(self):
        return self.piece_name

class ChessGame(models.Model):
    board_state = models.JSONField()  # Store board state as JSON
    current_turn = models.CharField(max_length=10, default='white')
    mode = models.CharField(max_length=20, choices=[("official", "Official"), ("custom", "Custom")])

    def __str__(self):
        return f"Game {self.id} - {self.current_turn}'s turn"
