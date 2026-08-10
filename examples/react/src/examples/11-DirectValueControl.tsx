import { createFormComponent, useForm } from '@avinlab/react-form';

interface RatingProps {
  name?: string;
  value: number;
  onChange: (value: number) => void;
}

function Rating({ value, onChange }: RatingProps) {
  return (
    <div className="button-row" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((item) => (
        <button
          type="button"
          className={item === value ? 'is-active' : undefined}
          key={item}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

const FormRating = createFormComponent(Rating);

export function DirectValueControl() {
  const form = useForm({ rating: 3 });

  return <FormRating form={form} name="rating" />;
}
