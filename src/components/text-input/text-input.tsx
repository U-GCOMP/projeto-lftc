export interface TextInputProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function TextInput(props: TextInputProps) {
    return (
        <label className="focus-within:text-accent-300">
            {props.label}
            <input
                id={props.id}
                type="text"
                className="flex flex-1 w-full px-4 py-2 border border-gray-300 focus:border-accent-300 rounded focus:outline-none focus:ring-1 focus:ring-accent-300"
                placeholder={props.placeholder}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
            />
        </label>
    )
}