import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css']
})
export class SignupFormComponent implements OnInit {
  role: string = '';
  signupForm!: FormGroup;
  fieldOrder: string[] = [];
  isLoading: boolean = false;

  // Persistent dropdown options (prevents re-creation each change detection cycle)
  selectOptionsMap: { [key: string]: { value: string | number; label: string }[] } = {
    gender: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ],
    experience: [
      { value: '0', label: 'Fresher' },
      { value: '1', label: '1 Year' },
      { value: '2', label: '2 Years' },
      { value: '3', label: '3 Years' },
      { value: '4', label: '4 Years' },
      { value: '5', label: '5 Years' },
      { value: '6', label: '6+ Years' },
      { value: '10', label: '10+ Years' }
    ],
    industry: [
      { value: 'technology', label: 'Technology' },
      { value: 'finance', label: 'Finance' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'education', label: 'Education' },
      { value: 'retail', label: 'Retail' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'consulting', label: 'Consulting' },
      { value: 'other', label: 'Other' }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.role = this.route.snapshot.paramMap.get('role') || '';
    this.buildForm();

    // Debug log for form value changes
    this.signupForm.valueChanges.subscribe(val => {
      console.log('[form values]', val);
    });
  }

  buildForm() {
    let fields: any = {};

    if (this.role === 'jobseeker') {
      this.fieldOrder = [
        'fullName', 'email', 'phoneNumber', 'gender',
        'linkedInURL', 'portfolioURL', 'experience', 'skills',
        'education', 'address', 'bio',
        'password', 'confirmPassword'
      ];

      fields.fullName = ['', Validators.required];
      fields.email = ['', [Validators.required, Validators.email]];
      fields.phoneNumber = ['', Validators.required];
      fields.gender = ['', Validators.required];
      fields.linkedInURL = [''];
      fields.portfolioURL = [''];
      fields.experience = ['', Validators.required];
      fields.skills = ['', Validators.required];
      fields.education = ['', Validators.required];
      fields.address = ['', Validators.required];
      fields.bio = [''];
    } else if (this.role === 'employer') {
      this.fieldOrder = [
        'fullName', 'email', 'companyName', 'website',
        'gender', 'designation', 'contactNumber', 'industry',
        'password', 'confirmPassword'
      ];

      fields.fullName = ['', Validators.required];
      fields.email = ['', [Validators.required, Validators.email]];
      fields.companyName = ['', Validators.required];
      fields.website = ['', Validators.required];
      fields.gender = ['', Validators.required];
      fields.designation = ['', Validators.required];
      fields.contactNumber = ['', Validators.required];
      fields.industry = ['', Validators.required];
    }

    fields.password = ['', Validators.required];
    fields.confirmPassword = ['', Validators.required];

    this.signupForm = this.fb.group(fields, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl) {
    const pass = control.get('password')?.value;
    const cpass = control.get('confirmPassword')?.value;
    return pass === cpass ? null : { passwordMismatch: true };
  }

  getFieldLabel(key: string): string {
    const labels: { [key: string]: string } = {
      fullName: 'Full Name',
      email: 'Email Address',
      phoneNumber: 'Phone Number',
      contactNumber: 'Contact Number',
      gender: 'Gender',
      linkedInURL: 'LinkedIn URL',
      portfolioURL: 'Portfolio URL',
      experience: 'Years of Experience',
      skills: 'Skills',
      education: 'Education',
      address: 'Address',
      bio: 'Bio',
      companyName: 'Company Name',
      website: 'Website',
      designation: 'Designation',
      industry: 'Industry',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    return labels[key] || key;
  }

  getInputType(key: string): string {
    const types: { [key: string]: string } = {
      email: 'email',
      password: 'password',
      confirmPassword: 'password',
      phoneNumber: 'tel',
      contactNumber: 'tel',
      linkedInURL: 'url',
      portfolioURL: 'url',
      website: 'url',
      experience: 'number'
    };
    return types[key] || 'text';
  }

  getPlaceholder(key: string): string {
    const placeholders: { [key: string]: string } = {
      fullName: 'Enter your full name',
      email: 'Enter your email address',
      phoneNumber: 'Enter your phone number',
      contactNumber: 'Enter your contact number',
      linkedInURL: 'https://linkedin.com/in/yourprofile',
      portfolioURL: 'https://yourportfolio.com',
      website: 'https://yourcompany.com',
      experience: 'Enter years of experience',
      skills: 'e.g., JavaScript, Angular, Node.js',
      education: 'Enter your education details',
      address: 'Enter your complete address',
      bio: 'Tell us about yourself...',
      companyName: 'Enter your company name',
      designation: 'Enter your job title',
      industry: 'Enter your industry',
      password: 'Enter a strong password',
      confirmPassword: 'Confirm your password'
    };
    return placeholders[key] || `Enter ${this.getFieldLabel(key).toLowerCase()}`;
  }

  getFieldIcon(key: string): string {
    const icons: { [key: string]: string } = {
      fullName: 'fas fa-user',
      email: 'fas fa-envelope',
      phoneNumber: 'fas fa-phone',
      contactNumber: 'fas fa-phone',
      gender: 'fas fa-venus-mars',
      linkedInURL: 'fab fa-linkedin',
      portfolioURL: 'fas fa-briefcase',
      website: 'fas fa-globe',
      experience: 'fas fa-calendar-alt',
      skills: 'fas fa-code',
      education: 'fas fa-graduation-cap',
      address: 'fas fa-map-marker-alt',
      bio: 'fas fa-user-edit',
      companyName: 'fas fa-building',
      designation: 'fas fa-id-badge',
      industry: 'fas fa-industry',
      password: 'fas fa-lock',
      confirmPassword: 'fas fa-lock'
    };
    return icons[key] || 'fas fa-text-width';
  }

  isSelectField(key: string): boolean {
    return ['gender', 'experience', 'industry'].includes(key);
  }

  isTextArea(key: string): boolean {
    return ['bio', 'address', 'skills'].includes(key);
  }

  getSelectOptions(key: string) {
    return this.selectOptionsMap[key] || [];
  }

  trackByOption(_index: number, item: { value: any; label: string }) {
    return item.value;
  }

  onSelectChange(event: Event, key: string) {
    const val = (event.target as HTMLSelectElement).value;
    console.log('[select change]', key, '->', val);
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      let dto: any;

      if (this.role === 'jobseeker') {
        dto = {
          fullName: this.signupForm.value.fullName,
          email: this.signupForm.value.email,
          password: this.signupForm.value.password,
          phoneNumber: this.signupForm.value.phoneNumber,
          gender: this.signupForm.value.gender,
          linkedInURL: this.signupForm.value.linkedInURL,
          portfolioURL: this.signupForm.value.portfolioURL,
          experience: Number(this.signupForm.value.experience),
          skills: this.signupForm.value.skills,
          education: this.signupForm.value.education,
          address: this.signupForm.value.address,
          bio: this.signupForm.value.bio
        };
      } else if (this.role === 'employer') {
        dto = {
          fullName: this.signupForm.value.fullName,
          email: this.signupForm.value.email,
          password: this.signupForm.value.password,
          companyName: this.signupForm.value.companyName,
          website: this.signupForm.value.website,
          gender: this.signupForm.value.gender,
          designation: this.signupForm.value.designation,
          contactNumber: this.signupForm.value.contactNumber,
          industry: this.signupForm.value.industry
        };
      }

      this.http.post(`https://localhost:7113/api/Registration/register-${this.role}`, dto)
        .subscribe({
          next: (res) => {
            console.log('Registration successful:', res);
            this.isLoading = false;
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('Error:', err);
            this.isLoading = false;
          }
        });
    } else {
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
    }
  }

  clearForm() {
    this.signupForm.reset();
    Object.keys(this.signupForm.controls).forEach(key => {
      this.signupForm.get(key)?.setErrors(null);
    });
  }
}
