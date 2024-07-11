interface propTypes  {
    name  :string;
    desc : string;
    date : string
}
export default function Event({name , desc, date}:propTypes){
    return (
        <div className="m-2 p-1 w-full bg-white border border-gray-100 rounded-lg shadow dark:bg-gray-50 dark:border-gray-300">
            <h2>{name}</h2>
            <span>{date}</span>
            <p>{desc}</p>
        </div>
    )
}