import type { Access, CollectionConfig } from 'payload'
import { isAppUser, isPayloadAdmin, serverOwnedField } from '../access/appUser'
import { degreeLevelOptions } from './Opportunities'

const ownAccount: Access = ({ req }) => {
  if (isPayloadAdmin(req.user)) return true
  if (!isAppUser(req.user)) return false
  return { id: { equals: req.user.id } }
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 2 * 60 * 60,
  },
  access: {
    create: () => true,
    delete: () => false,
    read: ownAccount,
    update: ownAccount,
  },
  admin: {
    hidden: true,
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      maxLength: 120,
    },
    {
      // Google account id (`sub`). Written only by the trusted OAuth callback (Local API with overrideAccess).
      name: 'googleSub',
      type: 'text',
      unique: true,
      index: true,
      access: { create: () => false, update: () => false },
      admin: { readOnly: true },
    },
    {
      name: 'studentProfile',
      type: 'group',
      fields: [
        { name: 'preferredName', type: 'text', maxLength: 80 },
        { name: 'phone', type: 'text', maxLength: 40 },
        { name: 'dateOfBirth', type: 'date' },
        { name: 'nationality', type: 'text', maxLength: 80 },
        { name: 'currentCity', type: 'text', maxLength: 120 },
        {
          name: 'educationLevel',
          type: 'select',
          options: [
            { label: 'High school', value: 'high-school' },
            { label: 'Bachelor’s degree', value: 'bachelor' },
            { label: 'Master’s degree', value: 'master' },
          ],
        },
        { name: 'institution', type: 'text', maxLength: 160 },
        { name: 'gpa', type: 'number', min: 0, max: 4 },
        { name: 'graduationYear', type: 'number', min: 1950, max: 2100 },
        { name: 'desiredDegree', type: 'select', options: degreeLevelOptions },
        { name: 'preferredField', type: 'text', maxLength: 120 },
        { name: 'preferredDestination', type: 'text', maxLength: 80 },
        {
          name: 'englishTest',
          type: 'select',
          options: [
            { label: 'IELTS', value: 'ielts' },
            { label: 'TOEFL', value: 'toefl' },
            { label: 'Duolingo', value: 'duolingo' },
          ],
        },
        { name: 'englishScore', type: 'number', min: 0, max: 160 },
        { name: 'annualBudgetThb', type: 'number', min: 0 },
        {
          name: 'fundingPreference',
          type: 'select',
          options: [
            { label: 'Full scholarship preferred', value: 'full' },
            { label: 'Partial scholarship acceptable', value: 'partial' },
            { label: 'Self-funded', value: 'self' },
          ],
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'language',
          type: 'select',
          defaultValue: 'en',
          options: [
            { label: 'English', value: 'en' },
            { label: 'ไทย', value: 'th' },
          ],
        },
        { name: 'timezone', type: 'text', defaultValue: 'Asia/Bangkok', maxLength: 60 },
        { name: 'emailUpdates', type: 'checkbox', defaultValue: true },
        { name: 'deadlineReminders', type: 'checkbox', defaultValue: true },
        {
          name: 'profileVisibility',
          type: 'select',
          defaultValue: 'private',
          options: [
            { label: 'Private', value: 'private' },
            { label: 'Visible to study buddies', value: 'buddies' },
          ],
        },
      ],
    },
    {
      name: 'buddyProfile',
      type: 'group',
      fields: [
        { name: 'intake', type: 'text', maxLength: 40 },
        { name: 'destinationCity', type: 'text', maxLength: 80 },
        { name: 'university', type: 'text', maxLength: 160 },
        { name: 'interests', type: 'text', hasMany: true, maxRows: 10 },
        { name: 'bio', type: 'textarea', maxLength: 300 },
      ],
    },
    {
      name: 'roadmap',
      type: 'group',
      fields: [
        { name: 'activePlan', type: 'relationship', relationTo: 'application-plans' },
        {
          name: 'completedStages',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Build application', value: 'build' },
            { label: 'Readiness review', value: 'review' },
            { label: 'Submitted', value: 'submit' },
          ],
        },
      ],
    },
    {
      // Billing state. Every field is server-owned: only the Stripe webhook and the billing
      // routes write it (Local API with overrideAccess), so a user can never grant themselves a plan.
      name: 'subscription',
      type: 'group',
      fields: [
        { name: 'stripeCustomerId', type: 'text', index: true, access: serverOwnedField },
        { name: 'stripeSubscriptionId', type: 'text', index: true, access: serverOwnedField },
        {
          name: 'plan',
          type: 'select',
          access: serverOwnedField,
          options: [
            { label: 'Starter', value: 'starter' },
            { label: 'Plus', value: 'plus' },
            { label: 'Multi-country', value: 'multi' },
            { label: 'Buffet', value: 'buffet' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'none',
          access: serverOwnedField,
          options: [
            { label: 'None', value: 'none' },
            { label: 'Active', value: 'active' },
            { label: 'Trialing', value: 'trialing' },
            { label: 'Past due', value: 'past_due' },
            { label: 'Canceled', value: 'canceled' },
            { label: 'Incomplete', value: 'incomplete' },
          ],
        },
        { name: 'currentPeriodEnd', type: 'date', access: serverOwnedField },
        {
          name: 'countryLimit',
          type: 'number',
          access: serverOwnedField,
          admin: { description: '-1 means unlimited.' },
        },
      ],
    },
    {
      // Changed only via PUT /pathora-api/billing/countries, which enforces the plan limit.
      name: 'selectedCountries',
      type: 'text',
      hasMany: true,
      maxRows: 250,
      access: serverOwnedField,
    },
    {
      name: 'localImportDone',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Set once browser-stored demo data has been imported.' },
    },
    {
      name: 'additionalInfo',
      type: 'array',
      maxRows: 20,
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          maxLength: 80,
        },
        {
          name: 'value',
          type: 'textarea',
          required: true,
          maxLength: 500,
        },
      ],
    },
  ],
}
