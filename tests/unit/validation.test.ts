import assert from 'node:assert/strict'
import { test } from 'node:test'
import { nextTick, ref } from 'vue'
import { check, email, max, maxLength, min, minLength, pattern, required, useValidation } from '../../registry/ui/field/validation.ts'

test('required rejects everything that counts as empty', () => {
  const rule = required('Needed.')
  for (const empty of [undefined, null, '', false, []]) assert.equal(rule(empty), 'Needed.')
  for (const filled of ['a', 0, true, ['x'], ' ']) assert.ok(!rule(filled))
})

test('the other rules pass on an empty value, so optional fields stay optional', () => {
  for (const rule of [email(), minLength(3), maxLength(3), pattern(/^\d+$/), min(2), max(2)]) {
    assert.ok(!rule(''))
    assert.ok(!rule(undefined))
  }
})

test('email, length, pattern and range rules', () => {
  assert.ok(!email()('ines@northwind.com'))
  assert.ok(email()('ines@northwind'))
  assert.ok(email()('not an email'))
  assert.ok(minLength(3)('ab'))
  assert.ok(!minLength(3)('abc'))
  assert.ok(maxLength(3)('abcd'))
  assert.ok(pattern(/^\d+$/, 'Digits only.')('12a'))
  assert.equal(min(2, 'Too few.')(1), 'Too few.')
  assert.ok(!min(2)(2))
  assert.ok(max(10)(11))
})

test('check returns the first message that applies', () => {
  assert.equal(check('', [required('First.'), email('Second.')]), 'First.')
  assert.equal(check('nope', [required('First.'), email('Second.')]), 'Second.')
  assert.equal(check('a@b.co', [required(), email()]), undefined)
  assert.equal(check('anything'), undefined, 'no rules, no problem')
})

test('useValidation is quiet until asked, then reports every field', () => {
  const values = ref({ name: '', email: 'nope' })
  const form = useValidation(values, { name: [required('Name needed.')], email: [required(), email('Bad email.')] })
  assert.equal(form.errors.name, undefined)
  assert.equal(form.validate(), false)
  assert.equal(form.errors.name, 'Name needed.')
  assert.equal(form.errors.email, 'Bad email.', 'all fields are checked, not just up to the first failure')
})

test('validate can check some fields and leave the rest alone', () => {
  const values = ref({ name: '', email: '' })
  const form = useValidation(values, { name: [required()], email: [required()] })
  assert.equal(form.validate(['name']), false)
  assert.ok(form.errors.name)
  assert.equal(form.errors.email, undefined)
})

test('a field with an error is re-checked as its value changes, and clears when fixed', async () => {
  const values = ref({ email: 'nope' })
  const form = useValidation(values, { email: [email('Bad email.')] })
  form.touch('email')
  assert.equal(form.errors.email, 'Bad email.')
  values.value.email = 'ines@northwind.com'
  await nextTick()
  assert.equal(form.errors.email, undefined)
})

test('a field that has not been checked stays quiet while it is being typed in', async () => {
  const values = ref({ email: '' })
  const form = useValidation(values, { email: [email()] })
  values.value.email = 'half-typ'
  await nextTick()
  assert.equal(form.errors.email, undefined)
})

test('reset clears every message', () => {
  const values = ref({ name: '' })
  const form = useValidation(values, { name: [required()] })
  form.validate()
  form.reset()
  assert.equal(form.errors.name, undefined)
})
