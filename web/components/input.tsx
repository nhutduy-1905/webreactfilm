import React from 'react';

export const InputField: React.FC<{ label: string; type?: string; value: string; onChange: (v: string) => void }> = ({
  label,
  type = 'text',
  value,
  onChange,
}) => {
  return (
    <div className='mb-4'>
      <label className='block text-gray-300 mb-2'>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none'
      />
    </div>
  );
};

export default InputField;
