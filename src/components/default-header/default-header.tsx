interface DefaultHeaderProps {
    title: string,
    description: string
}

export default function DefaultHeader({title, description}: DefaultHeaderProps) {
    return (
        <section className="flex flex-col items-center mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-accent-default text-center">
                {title}
            </h1>
            <p className="max-w-2xl text-white mb-6 text-lg text-center">
                {description}
            </p>
        </section>
    )
}