// src/app/components/profile/settings/profile-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { UserService } from '../../../services/user.service';
// import { UserUpdate } from '../../../models/user.model'; // Модель для оновлення
// import { NotificationService } from '../../../services/notification.service'; // Для сповіщень

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  settingsForm!: FormGroup; // Використовуємо ! для позначення, що ініціалізується в ngOnInit
  isLoading: boolean = false; // Для індикації завантаження/збереження
  isUserDataLoading: boolean = true; // Для завантаження початкових даних

  // Поля для збереження поточних значень, щоб не показувати їх у формі пароля
  currentUsername: string = '';
  currentEmail: string = '';

  constructor(
    private fb: FormBuilder,
    // private userService: UserService,
    // private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadUserSettings();
  }

  initForm(): void {
    this.settingsForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''], // Для зміни пароля, якщо потрібно підтвердження старого
      newPassword: ['', [Validators.minLength(6)]], // Робимо не обов'язковим
      confirmNewPassword: ['']
    }, { validator: this.passwordMatchValidator }); // Валідатор для співпадіння паролів
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;
    // Встановлюємо помилку на поле confirmNewPassword, якщо паролі не співпадають і новий пароль введено
    if (newPassword && newPassword !== confirmNewPassword) {
      form.get('confirmNewPassword')?.setErrors({ mismatch: true });
    } else {
      // Якщо паролі співпадають або новий пароль не введено, прибираємо помилку
      // але тільки якщо помилка була саме 'mismatch'
      if (form.get('confirmNewPassword')?.hasError('mismatch')) {
         form.get('confirmNewPassword')?.setErrors(null);
      }
    }
    return null;
  }


  loadUserSettings(): void {
    this.isUserDataLoading = true;
    // const userId = 'currentUserId';
    // this.userService.getUserSettings(userId).subscribe(
    //   (settings) => {
    //     this.currentUsername = settings.username;
    //     this.currentEmail = settings.email;
    //     this.settingsForm.patchValue({
    //       username: settings.username,
    //       email: settings.email
    //     });
    //     this.isUserDataLoading = false;
    //   },
    //   (error) => {
    //     console.error('Error loading user settings:', error);
    //     // this.notificationService.showError('Failed to load settings.');
    //     this.isUserDataLoading = false;
    //   }
    // );

    // Заглушка:
    setTimeout(() => {
      this.currentUsername = 'John Doe';
      this.currentEmail = 'johndoe@example.com';
      this.settingsForm.patchValue({
        username: this.currentUsername,
        email: this.currentEmail,
      });
      this.isUserDataLoading = false;
    }, 500);
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      // Показати помилки валідації або просто вийти
      this.markFormGroupTouched(this.settingsForm);
      // this.notificationService.showWarning('Please correct the errors in the form.');
      console.log('Form is invalid:', this.settingsForm.value);
      console.log('Username errors:', this.settingsForm.get('username')?.errors);
      console.log('Email errors:', this.settingsForm.get('email')?.errors);
      console.log('New Password errors:', this.settingsForm.get('newPassword')?.errors);
      console.log('Confirm New Password errors:', this.settingsForm.get('confirmNewPassword')?.errors);
      return;
    }

    this.isLoading = true;
    const formData = this.settingsForm.value;
    // const updateData: UserUpdate = { // Створити інтерфейс UserUpdate
    //   username: formData.username,
    //   email: formData.email,
    // };

    // if (formData.newPassword) {
    //   if (!formData.currentPassword) {
    //      // this.notificationService.showError('Please enter your current password to change it.');
    //      this.settingsForm.get('currentPassword')?.setErrors({ requiredToChange: true });
    //      this.isLoading = false;
    //      return;
    //   }
    //   updateData.currentPassword = formData.currentPassword;
    //   updateData.newPassword = formData.newPassword;
    // }
    
    // console.log('Submitting settings:', updateData);

    // this.userService.updateUserSettings('currentUserId', updateData).subscribe(
    //   (response) => {
    //     this.isLoading = false;
    //     // this.notificationService.showSuccess('Settings updated successfully!');
    //     // Оновити поточні значення, якщо потрібно, та очистити поля паролів
    //     this.currentUsername = updateData.username;
    //     this.currentEmail = updateData.email;
    //     this.settingsForm.patchValue({
    //       currentPassword: '',
    //       newPassword: '',
    //       confirmNewPassword: ''
    //     });
    //     this.settingsForm.get('newPassword')?.clearValidators(); // Очистити валідатори, якщо пароль був змінений
    //     this.settingsForm.get('newPassword')?.updateValueAndValidity();
    //     this.settingsForm.get('confirmNewPassword')?.clearValidators();
    //     this.settingsForm.get('confirmNewPassword')?.updateValueAndValidity();

    //   },
    //   (error) => {
    //     this.isLoading = false;
    //     console.error('Error updating settings:', error);
    //     // this.notificationService.showError(error.message || 'Failed to update settings.');
    //   }
    // );

    // Заглушка:
    console.log('Submitting settings:', formData);
    setTimeout(() => {
      this.isLoading = false;
      // this.notificationService.showSuccess('Settings (simulated) updated successfully!');
      alert('Settings (simulated) updated successfully!');
      this.currentUsername = formData.username;
      this.currentEmail = formData.email;
      this.settingsForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
       this.settingsForm.markAsPristine(); // Позначити форму як "незмінену"
    }, 1500);
  }

  // Допоміжна функція для того, щоб показати помилки валідації для всіх полів
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters for easy access to form controls in template
  get username() { return this.settingsForm.get('username'); }
  get email() { return this.settingsForm.get('email'); }
  get currentPassword() { return this.settingsForm.get('currentPassword'); }
  get newPassword() { return this.settingsForm.get('newPassword'); }
  get confirmNewPassword() { return this.settingsForm.get('confirmNewPassword'); }
}