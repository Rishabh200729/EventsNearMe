import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import Participator from "@/components/Participator";
import Creator from "@/components/Creator";
import { findEventsFromUserID } from "@/lib/db";
import Event from "@/components/Event";
import SideBar from "@/components/SideBar";
export default async function Home() {
  const user = await validateRequest();
  const data = await findEventsFromUserID();
  console.log(data)
  if (!user.user) {
    return redirect("/login");
  }
  else {
    return <>
    <div className="grid grid-cols-1 ">
      <SideBar />
      {data.events.map(({ _id, name, description, date }: item) => {
        return <Event key={_id} name={name} desc={description} date={date} />
      })}
      {user.user.role === "Participator" ? <Participator user={user.user} events={data.events} /> : <Creator user={user.user} />}
    </div>
    </>

  }
}
