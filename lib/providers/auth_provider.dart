import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';

class AuthState {
  final AppUser? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({AppUser? user, bool? isLoading, String? error}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState());

  Future<void> login(String studentId, String nationalId) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // Simulating network request for authentication
      await Future.delayed(const Duration(seconds: 1));

      // Simple mock logic for validation
      // Student ID format: N followed by digits and optional letters (e.g., N02124567A08)
      // National ID format: 00-000000X00 (Zim format)
      if (!RegExp(r'^[Nn][0-9]+[A-Za-z]?[0-9]*$').hasMatch(studentId)) {
        throw 'Invalid Student ID format. Should start with N.';
      }

      if (!RegExp(r'^[0-9]{2}-[0-9]{6,7}[A-Za-z][0-9]{2}$').hasMatch(nationalId)) {
        throw 'Invalid Zimbabwe National ID format (e.g., 00-000000A00).';
      }

      // Successful login mock user
      final user = AppUser(
        studentId: studentId.toUpperCase(),
        fullName: 'Tafara Mukucha',
        department: 'Computer Science',
        year: '3rd Year',
      );

      state = state.copyWith(user: user, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  void logout() {
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
