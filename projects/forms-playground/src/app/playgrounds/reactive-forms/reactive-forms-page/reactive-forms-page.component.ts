import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Pipe,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormRecord,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Observable,
  Subscription,
  bufferCount,
  filter,
  startWith,
  tap,
} from 'rxjs';
import { UserSkillsService } from '../../../core/user-skills.service';
import { banWords } from '../validators/ban-words.validator';
import { passwordShouldMatch } from '../validators/password-should-match.validator';
import { UniqueNicknameValidator } from '../validators/unique-nickname.validator';

@Component({
  selector: 'app-reactive-forms-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reactive-forms-page.component.html',
  styleUrls: [
    '../../common-page.scss',
    '../../common-form.scss',
    './reactive-forms-page.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactiveFormsPageComponent implements OnInit, OnDestroy {
  phoneLabels = ['Main', 'Mobile', 'Work', 'Home'];
  years = this.getYears();

  skills$!: Observable<string[]>;
  /* 
  form = new FormGroup({
    firstName: new FormControl('Manohar'),
    lastName: new FormControl('KS'),
    nickname: new FormControl(''),
    email: new FormControl('manohar@gmail.com'),
    yearOfBirth: new FormControl(this.years[this.years.length - 1], {
      nonNullable: true,
    }),
    passport: new FormControl(''),
    address: new FormGroup({
      fullAddress: new FormControl('', { nonNullable: true }),
      city: new FormControl('', { nonNullable: true }),
      postCode: new FormControl(0, { nonNullable: true }),
    }),
    phones: new FormArray([
      new FormGroup({
        label: new FormControl(this.phoneLabels[0], { nonNullable: true }),
        phone: new FormControl(''),
      }),
    ]),
    // skills: new FormGroup<{ [key: string]: FormControl<boolean> }>({}),

    skills: new FormRecord<FormControl<boolean>>({}),
  }); 
  */

  form = this.fb.group({
    firstName: [
      '',
      [
        Validators.required,
        Validators.maxLength(25),
        Validators.pattern(/^[a-zA-Z\s.'-]+$/),
        banWords(['test', 'dummy']),
      ],
      ,
    ],
    lastName: ['KS', [Validators.required, Validators.minLength(2)]],
    nickname: [
      '',
      {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[\w.]+$/),
        ],
        asyncValidators: [
          this.uniqueNickname.validate.bind(this.uniqueNickname),
        ],

        updateOn: 'blur',
      },
      ,
    ],
    email: [
      'manohar@gmail.com',
      [
        Validators.email,
        Validators.required,
        // Validators.pattern(
        //   /^(?!.*@.*@)(?!.*@-$)(?!.*-@)(?!.*\.\.)(?!.*\.\.)(?!.*\-\-)(?!.*\-\-)(?!.*\.-)(?!.*-\.)[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?@[a-z0-9.-]+\.[a-z]+$/
        // ),
        Validators.maxLength(50),
      ],
    ],
    yearOfBirth: this.fb.nonNullable.control(
      this.years[this.years.length - 1],
      Validators.required
    ),
    passport: [
      '',
      [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{6}$/)],
    ],
    address: this.fb.nonNullable.group({
      fullAddress: ['', Validators.required],
      city: ['', Validators.required],
      postCode: [0, Validators.required],
    }),
    phones: this.fb.array([
      this.fb.group({
        label: this.fb.nonNullable.control(this.phoneLabels[0]),
        phone: '',
      }),
    ]),
    skills: this.fb.record<boolean>({}),
    password: this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: '',
      },
      {
        validators: passwordShouldMatch,
      }
    ),
  });

  private ageValidators!: Subscription;
  private formPendingState!: Subscription;

  constructor(
    private userSkill: UserSkillsService,
    private fb: FormBuilder,
    private uniqueNickname: UniqueNicknameValidator,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.skills$ = this.userSkill
      .getSkills()
      .pipe(tap((skills) => this.buildSkillControls(skills)));

    this.ageValidators = this.form.controls.yearOfBirth.valueChanges
      .pipe(
        tap(() => {
          this.form.controls.passport.markAsDirty();
        }),
        startWith(this.form.controls.yearOfBirth.value)
      )
      .subscribe((yearOfBirth) => {
        this.isAdult(yearOfBirth)
          ? this.form.controls.passport.addValidators(Validators.required)
          : this.form.controls.passport.removeValidators(Validators.required);

        this.form.controls.passport.updateValueAndValidity();
      });

    this.form.valueChanges.subscribe(() => {
      console.log('form value changes');
    });

    this.formPendingState = this.form.statusChanges
      .pipe(
        bufferCount(2, 1),
        filter(([prevState]) => prevState === 'PENDING')
      )
      .subscribe(() => this.cd.markForCheck());
  }

  addPhone() {
    (this.form.get('phones') as FormArray).insert(
      0,
      new FormGroup({
        label: new FormControl(this.phoneLabels[0]),
        phone: new FormControl(''),
      })
    );
  }

  removePhone(i: number) {
    (this.form.get('phones') as FormArray).removeAt(i);
  }

  onSubmit(e: Event) {
    console.log(this.form);
  }

  private getYears() {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 29))
      .fill('')
      .map((_, idx) => now - idx);
  }

  private buildSkillControls(skills: string[]) {
    skills.forEach((skill) =>
      this.form.controls.skills.addControl(
        skill,
        new FormControl(false, { nonNullable: true })
      )
    );
  }

  test() {
    console.log(this.form.get('nickname')?.errors?.['pattren']);
  }

  private isAdult(yearOfBirth: number): boolean {
    const currentYear = new Date().getFullYear();
    return currentYear - yearOfBirth >= 18;
  }

  ngOnDestroy(): void {
    this.ageValidators.unsubscribe();
    this.formPendingState.unsubscribe();
  }
}
