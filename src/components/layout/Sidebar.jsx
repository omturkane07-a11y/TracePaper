import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  FileText,
  Users,
  BarChart3,
  Settings
} from "lucide-react";


export default function Sidebar(){


const menuItems = [

{
name:"Dashboard",
path:"/dashboard",
icon:<LayoutDashboard size={20}/>
},


{
name:"Investigations",
path:"/investigations",
icon:<Search size={20}/>
},


{
name:"Audit Trail",
path:"/audit-trail",
icon:<ShieldCheck size={20}/>
},


{
name:"Leak Detection",
path:"/leak-detection",
icon:<ShieldCheck size={20}/>
},


{
name:"Reports",
path:"/reports",
icon:<FileText size={20}/>
},


{
name:"Users",
path:"/users",
icon:<Users size={20}/>
},


{
name:"Analytics",
path:"/analytics",
icon:<BarChart3 size={20}/>
},


{
name:"Settings",
path:"/settings",
icon:<Settings size={20}/>
}

];



return (

<div className="w-64 min-h-screen bg-slate-900 text-white p-5">


<h1 className="text-2xl font-bold mb-8">
TracePaper
</h1>



<nav className="space-y-2">


{
menuItems.map((item)=>(


<NavLink

key={item.name}

to={item.path}

className={({isActive}) =>

`
flex items-center gap-3 px-4 py-3 rounded-lg transition

${
isActive
?
"bg-blue-600 text-white"
:
"text-slate-300 hover:bg-slate-800"
}

`

}

>


{item.icon}


<span>
{item.name}
</span>


</NavLink>


))

}


</nav>


</div>

)

}