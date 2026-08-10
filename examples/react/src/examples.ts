import { CompleteProfileForm } from './examples/00-CompleteProfileForm';
import completeProfileFormSource from './examples/00-CompleteProfileForm.tsx?raw';
import { ControlledField } from './examples/01-ControlledField';
import controlledFieldSource from './examples/01-ControlledField.tsx?raw';
import { ConvertDomValue } from './examples/02-ConvertDomValue';
import convertDomValueSource from './examples/02-ConvertDomValue.tsx?raw';
import { UncontrolledField } from './examples/03-UncontrolledField';
import uncontrolledFieldSource from './examples/03-UncontrolledField.tsx?raw';
import { WholeFormSnapshot } from './examples/04-WholeFormSnapshot';
import wholeFormSnapshotSource from './examples/04-WholeFormSnapshot.tsx?raw';
import { ReplaceSnapshot } from './examples/05-ReplaceSnapshot';
import replaceSnapshotSource from './examples/05-ReplaceSnapshot.tsx?raw';
import { BasicValidation } from './examples/06-BasicValidation';
import basicValidationSource from './examples/06-BasicValidation.tsx?raw';
import { DynamicValidationRule } from './examples/07-DynamicValidationRule';
import dynamicValidationRuleSource from './examples/07-DynamicValidationRule.tsx?raw';
import { ShareValidationResult } from './examples/08-ShareValidationResult';
import shareValidationResultSource from './examples/08-ShareValidationResult.tsx?raw';
import { GeneratedTextInput } from './examples/09-GeneratedTextInput';
import generatedTextInputSource from './examples/09-GeneratedTextInput.tsx?raw';
import { CustomControlProps } from './examples/10-CustomControlProps';
import customControlPropsSource from './examples/10-CustomControlProps.tsx?raw';
import { DirectValueControl } from './examples/11-DirectValueControl';
import directValueControlSource from './examples/11-DirectValueControl.tsx?raw';
import { SyncExternalData } from './examples/12-SyncExternalData';
import syncExternalDataSource from './examples/12-SyncExternalData.tsx?raw';
import { ComposeWithFormProp } from './examples/13-ComposeWithFormProp';
import composeWithFormPropSource from './examples/13-ComposeWithFormProp.tsx?raw';
import { IsolatedFieldWatchers } from './examples/14-IsolatedFieldWatchers';
import isolatedFieldWatchersSource from './examples/14-IsolatedFieldWatchers.tsx?raw';
import { ImperativeRead } from './examples/15-ImperativeRead';
import imperativeReadSource from './examples/15-ImperativeRead.tsx?raw';
import { FieldSubscription } from './examples/16-FieldSubscription';
import fieldSubscriptionSource from './examples/16-FieldSubscription.tsx?raw';
import { FormSubscription } from './examples/17-FormSubscription';
import formSubscriptionSource from './examples/17-FormSubscription.tsx?raw';
import { PreviousSnapshot } from './examples/18-PreviousSnapshot';
import previousSnapshotSource from './examples/18-PreviousSnapshot.tsx?raw';
import { ReplaceNestedValue } from './examples/19-ReplaceNestedValue';
import replaceNestedValueSource from './examples/19-ReplaceNestedValue.tsx?raw';
import { DynamicFieldName } from './examples/20-DynamicFieldName';
import dynamicFieldNameSource from './examples/20-DynamicFieldName.tsx?raw';
import { ExternalController } from './examples/21-ExternalController';
import externalControllerSource from './examples/21-ExternalController.tsx?raw';
import { CoreValidation } from './examples/22-CoreValidation';
import coreValidationSource from './examples/22-CoreValidation.tsx?raw';
import { NoOpUpdates } from './examples/23-NoOpUpdates';
import noOpUpdatesSource from './examples/23-NoOpUpdates.tsx?raw';
import { SwitchFormSource } from './examples/24-SwitchFormSource';
import switchFormSource from './examples/24-SwitchFormSource.tsx?raw';
import { PreviousValuesValidator } from './examples/25-PreviousValuesValidator';
import previousValuesValidatorSource from './examples/25-PreviousValuesValidator.tsx?raw';
import { ManualCoreValidation } from './examples/26-ManualCoreValidation';
import manualCoreValidationSource from './examples/26-ManualCoreValidation.tsx?raw';
import { ReplaceCoreValidator } from './examples/27-ReplaceCoreValidator';
import replaceCoreValidatorSource from './examples/27-ReplaceCoreValidator.tsx?raw';
import type { Example } from './components/ExampleCard';

export interface ExampleSection {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  examples: Example[];
}

const sections: ExampleSection[] = [
  {
    id: 'essentials',
    eyebrow: 'Start here',
    title: 'Essentials',
    description: 'The smallest useful forms: one field, one snapshot, one validation result.',
    examples: [
      {
        id: 'complete-profile-form',
        title: 'Complete profile workflow',
        summary:
          'Load, edit, validate, submit, handle a server rejection, and reset one complete form.',
        tags: ['Basics', 'React', 'Validation', 'State sync'],
        api: ['useForm', 'useFormWatch', 'useFormValidation', 'setValues', 'form.values'],
        Component: CompleteProfileForm,
        source: completeProfileFormSource,
      },
      {
        id: 'controlled-field',
        title: 'Controlled field',
        summary: 'Watch one field and write back through the stable form controller.',
        tags: ['Basics', 'React', 'Controls'],
        api: ['useForm', 'useFormWatch', 'setValue'],
        Component: ControlledField,
        source: controlledFieldSource,
      },
      {
        id: 'convert-dom-value',
        title: 'Convert DOM values',
        summary:
          'DOM inputs emit strings; convert them at the form boundary to preserve field types.',
        tags: ['Basics', 'Controls'],
        api: ['useFormWatch', 'setValue'],
        Component: ConvertDomValue,
        source: convertDomValueSource,
      },
      {
        id: 'uncontrolled-field',
        title: 'Uncontrolled field',
        summary: 'Write edits without subscribing the owner when live React output is unnecessary.',
        tags: ['React', 'Controls', 'Performance'],
        api: ['useForm', 'form.values'],
        Component: UncontrolledField,
        source: uncontrolledFieldSource,
      },
      {
        id: 'whole-form-snapshot',
        title: 'Watch the whole form',
        summary: 'Subscribe to one atomic readonly snapshot when an output needs several fields.',
        tags: ['Basics', 'React'],
        api: ['useFormWatch(form)'],
        Component: WholeFormSnapshot,
        source: wholeFormSnapshotSource,
      },
      {
        id: 'replace-snapshot',
        title: 'Reset with setValues',
        summary:
          'Replace the complete snapshot for reset, loading a record, or server synchronization.',
        tags: ['Basics', 'State sync'],
        api: ['setValues'],
        Component: ReplaceSnapshot,
        source: replaceSnapshotSource,
      },
      {
        id: 'basic-validation',
        title: 'Synchronous validation',
        summary: 'Read status and errors from the same atomic validation result.',
        tags: ['Basics', 'React', 'Validation'],
        api: ['useFormValidation'],
        Component: BasicValidation,
        source: basicValidationSource,
      },
    ],
  },
  {
    id: 'react-patterns',
    eyebrow: 'Everyday React',
    title: 'Composition and controls',
    description: 'Patterns for real component trees without hiding the controller model.',
    examples: [
      {
        id: 'dynamic-validation-rule',
        title: 'Validator with dependencies',
        summary: 'Memoize a closure-based validator; a changed function means a changed rule.',
        tags: ['React', 'Validation', 'Advanced'],
        api: ['useCallback', 'useFormValidation'],
        Component: DynamicValidationRule,
        source: dynamicValidationRuleSource,
      },
      {
        id: 'share-validation-result',
        title: 'Share one validation result',
        summary: 'Validate once, then pass the complete result to every child that renders it.',
        tags: ['React', 'Validation', 'Performance'],
        api: ['ValidationResult'],
        Component: ShareValidationResult,
        source: shareValidationResultSource,
      },
      {
        id: 'previous-values-validator',
        title: 'Validate a transition',
        summary: 'Validators receive both snapshots when a rule depends on what just changed.',
        tags: ['Validation', 'Advanced'],
        api: ['ValidationFunction', 'prevValues'],
        Component: PreviousValuesValidator,
        source: previousValuesValidatorSource,
      },
      {
        id: 'generated-text-input',
        title: 'Generate a bound input',
        summary:
          'Remove repeated controlled binding in a component library with createFormComponent.',
        tags: ['React', 'Controls'],
        api: ['createFormComponent', 'getValue'],
        Component: GeneratedTextInput,
        source: generatedTextInputSource,
      },
      {
        id: 'custom-control-props',
        title: 'Custom value and change props',
        summary: 'Bind controls that use checked/onToggle instead of value/onChange.',
        tags: ['React', 'Controls', 'Advanced'],
        api: ['valueAttrName', 'onChangeAttrName'],
        Component: CustomControlProps,
        source: customControlPropsSource,
      },
      {
        id: 'direct-value-control',
        title: 'Control that emits a value',
        summary: 'Omit getValue when the first callback argument already is the field value.',
        tags: ['React', 'Controls', 'Advanced'],
        api: ['createFormComponent'],
        Component: DirectValueControl,
        source: directValueControlSource,
      },
      {
        id: 'sync-external-data',
        title: 'Synchronize external data',
        summary:
          'useForm reads its argument once; explicitly replace values when remote data changes.',
        tags: ['React', 'State sync'],
        api: ['useEffect', 'setValues'],
        Component: SyncExternalData,
        source: syncExternalDataSource,
      },
      {
        id: 'compose-with-form-prop',
        title: 'Pass the controller through props',
        summary:
          'The form identity is stable, so it is safe in props, contexts, and dependency lists.',
        tags: ['Basics', 'React'],
        api: ['Form<T>'],
        Component: ComposeWithFormProp,
        source: composeWithFormPropSource,
      },
      {
        id: 'isolated-field-watchers',
        title: 'Isolate field renders',
        summary: 'A selected-field watcher ignores commits to every other field.',
        tags: ['React', 'Performance'],
        api: ['useFormWatch(form, field)'],
        Component: IsolatedFieldWatchers,
        source: isolatedFieldWatchersSource,
      },
      {
        id: 'imperative-read',
        title: 'Read without subscribing',
        summary:
          'Use form.values inside an event handler when the render does not need live updates.',
        tags: ['React', 'Performance'],
        api: ['form.values'],
        Component: ImperativeRead,
        source: imperativeReadSource,
      },
    ],
  },
  {
    id: 'subscriptions',
    eyebrow: 'Integrations',
    title: 'Subscriptions and history',
    description: 'Connect analytics, persistence, and non-React consumers at the narrowest level.',
    examples: [
      {
        id: 'field-subscription',
        title: 'Subscribe to one field',
        summary: 'Observe a field imperatively and return the disposer from an effect.',
        tags: ['Subscriptions', 'Advanced'],
        api: ['subscribeField'],
        Component: FieldSubscription,
        source: fieldSubscriptionSource,
      },
      {
        id: 'form-subscription',
        title: 'Subscribe to every commit',
        summary: 'Observe successful whole-form commits for persistence or instrumentation.',
        tags: ['Subscriptions', 'Advanced'],
        api: ['subscribe'],
        Component: FormSubscription,
        source: formSubscriptionSource,
      },
      {
        id: 'previous-snapshot',
        title: 'Compare previous values',
        summary: 'Every successful commit exposes its current and immediately previous snapshots.',
        tags: ['Subscriptions', 'State sync', 'Advanced'],
        api: ['prevValues', 'subscribe'],
        Component: PreviousSnapshot,
        source: previousSnapshotSource,
      },
    ],
  },
  {
    id: 'advanced',
    eyebrow: 'Less common',
    title: 'Advanced controller techniques',
    description:
      'Reference equality, dynamic sources, nested values, and framework-independent use.',
    examples: [
      {
        id: 'replace-nested-value',
        title: 'Replace nested values',
        summary: 'Snapshots are shallow: replace a nested field reference instead of mutating it.',
        tags: ['State sync', 'Advanced'],
        api: ['setValue', 'Readonly<T>'],
        Component: ReplaceNestedValue,
        source: replaceNestedValueSource,
      },
      {
        id: 'dynamic-field-name',
        title: 'Switch the watched field',
        summary: 'The watcher immediately reads a newly selected field and moves its subscription.',
        tags: ['React', 'Advanced'],
        api: ['useFormWatch'],
        Component: DynamicFieldName,
        source: dynamicFieldNameSource,
      },
      {
        id: 'external-controller',
        title: 'Use a controller created outside React',
        summary: 'Core controllers can live in a service or module and still drive React watchers.',
        tags: ['Core', 'React'],
        api: ['createForm', 'useFormWatch'],
        Component: ExternalController,
        source: externalControllerSource,
      },
      {
        id: 'core-validation',
        title: 'Validate without React hooks',
        summary:
          'The core validation controller derives and publishes atomic results synchronously.',
        tags: ['Core', 'Validation'],
        api: ['createFormValidation', 'subscribe', 'dispose'],
        Component: CoreValidation,
        source: coreValidationSource,
      },
      {
        id: 'manual-core-validation',
        title: 'Revalidate an external dependency',
        summary: 'Call validate when a non-form value used by a core validator changes.',
        tags: ['Core', 'Validation', 'Advanced'],
        api: ['validation.validate'],
        Component: ManualCoreValidation,
        source: manualCoreValidationSource,
      },
      {
        id: 'replace-core-validator',
        title: 'Replace a core validator',
        summary: 'setValidator immediately recalculates the current snapshot with the new rule.',
        tags: ['Core', 'Validation', 'Advanced'],
        api: ['validation.setValidator'],
        Component: ReplaceCoreValidator,
        source: replaceCoreValidatorSource,
      },
      {
        id: 'no-op-updates',
        title: 'No-op updates do not notify',
        summary: 'Top-level fields use Object.is; assigning the same value causes no commit.',
        tags: ['Core', 'Performance', 'Advanced'],
        api: ['Object.is', 'subscribe'],
        Component: NoOpUpdates,
        source: noOpUpdatesSource,
      },
      {
        id: 'switch-form-source',
        title: 'Switch the watched controller',
        summary:
          'A watcher can move between long-lived forms and reads the new snapshot immediately.',
        tags: ['React', 'State sync', 'Advanced'],
        api: ['useFormWatch'],
        Component: SwitchFormSource,
        source: switchFormSource,
      },
    ],
  },
];

const exampleOrder = [
  'complete-profile-form',
  'controlled-field',
  'convert-dom-value',
  'basic-validation',
  'whole-form-snapshot',
  'replace-snapshot',
  'sync-external-data',
  'compose-with-form-prop',
  'isolated-field-watchers',
  'uncontrolled-field',
  'imperative-read',
  'generated-text-input',
  'custom-control-props',
  'share-validation-result',
  'dynamic-validation-rule',
  'direct-value-control',
  'field-subscription',
  'form-subscription',
  'previous-snapshot',
  'replace-nested-value',
  'previous-values-validator',
  'external-controller',
  'core-validation',
  'no-op-updates',
  'dynamic-field-name',
  'switch-form-source',
  'manual-core-validation',
  'replace-core-validator',
] as const;

const unorderedExamples = sections.flatMap((section) => section.examples);

export const examples = exampleOrder.map((id) => {
  const example = unorderedExamples.find((item) => item.id === id);

  if (!example) throw new Error(`Unknown example: ${id}`);

  return example;
});

export const exampleTags = [
  'Basics',
  'React',
  'Validation',
  'Controls',
  'State sync',
  'Performance',
  'Subscriptions',
  'Core',
  'Advanced',
] as const;
