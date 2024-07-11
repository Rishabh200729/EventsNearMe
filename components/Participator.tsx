'use client';

import { useAppContext } from "@/app/Context/store";
import Event from "./Event";

export default function Participator({user, events}){
    const {value,setValue} = useAppContext();
    setValue(user);
    console.log(events)
    return (
        <div>
            <h1>All the current events</h1>
            <div className="grid grid-cols-2">
            {events.map(({_id,name , description, date}:item)=>{
                return <Event key = {_id} name = {name}  desc = {description} date = {date}/>
            })}
            </div>
        </div>
    )
}

type item = {
    name : string , 
    description : string ,
    date : string,
    _id : string,
    userId : string
}