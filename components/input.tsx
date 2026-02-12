import React from "react";
<<<<<<< HEAD
interface InputProps {
    id: string;
    onChange: any,
    type?: string;
    label: string;
    value: string;
}

const Input: React.FC<InputProps> = ({
    id,
    onChange,
    type,
    label,
    value,

}) => {
    return (
        <div className="relative">

            <input 
            id={id}
            type={type ? type : 'text'}
            onChange={onChange}
            value={value}
            className="
                block
                rounded-md
                px-6
                pt-6
                pb-1
                w-full
                text-md
                text-white
                bg-neutral-700
                apperance-700
                focus:outline-none
                focus:ring-0
                peer
            " 
            placeholder=" "
            />
            <label 
            className="
                absolute
                text-zinc-400
                duration-150
                transform
                -translate-y-3
                scale-75
                top-4
                origin-[0]
                left-6
                peer-placeholder-shown:scale-100
                peer-placeholder-shown:translate-y-0
                peer-focus:scale-75
                peer-focus:-translate-y-3
            "
            htmlFor={id}>
                {label}
            </label>
        </div>
    );

}

export default Input;
=======

interface InputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean; // thêm dòng này
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="
          block
          px-6
          pt-6
          pb-1
          w-full
          text-md
          text-white
          bg-neutral-700
          rounded-md
          appearance-none
          focus:outline-none
          focus:ring-0
          peer
          disabled:opacity-70
          disabled:cursor-not-allowed
        "
        placeholder=" "
      />
      <label
        htmlFor={id}
        className="
          absolute
          text-md
          text-zinc-400
          duration-150
          transform
          -translate-y-3
          scale-75
          top-4
          z-10
          origin-[0]
          left-6
          peer-placeholder-shown:scale-100
          peer-placeholder-shown:translate-y-0
          peer-focus:scale-75
          peer-focus:-translate-y-3
        "
      >
        {label}
      </label>
    </div>
  );
};

export default Input;
>>>>>>> b600d68c (chore: clean git index and ignore node_modules/build artifacts)
