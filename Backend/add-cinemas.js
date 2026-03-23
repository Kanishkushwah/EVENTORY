import { supabase } from './src/config/supabase.js';

async function addCinemas() {
  const cinemas = [
    {
      name: "Cinepolis VR Mall",
      location: "VR Mall",
      address: "VR Mall, Dumas Road, Magdalla, Surat",
      city: "Surat",
      total_screens: 6
    },
    {
      name: "PVR Rahul Raj",
      location: "Rahul Raj Mall",
      address: "Piplod, Surat",
      city: "Surat",
      total_screens: 4
    },
    {
      name: "PVR Select CityWalk",
      location: "Saket",
      address: "Select CityWalk Mall, New Delhi",
      city: "Delhi",
      total_screens: 8
    },
    {
      name: "INOX Nehru Place",
      location: "Nehru Place",
      address: "Epicuria, New Delhi",
      city: "Delhi",
      total_screens: 5
    },
    {
      name: "Cinepolis Orion Mall",
      location: "Rajajinagar",
      address: "Orion Mall, Bangalore",
      city: "Bangalore",
      total_screens: 7
    },
    {
      name: "PVR Forum Mall",
      location: "Koramangala",
      address: "The Forum Mall, Bangalore",
      city: "Bangalore",
      total_screens: 5
    },
    {
      name: "INOX South City",
      location: "Prince Anwar Shah Road",
      address: "South City Mall, Kolkata",
      city: "Kolkata",
      total_screens: 6
    },
    {
      name: "Cinepolis Acropolis",
      location: "Kasba",
      address: "Acropolis Mall, Kolkata",
      city: "Kolkata",
      total_screens: 4
    }
  ];

  for (const c of cinemas) {
    const { data: existing, error: searchError } = await supabase
      .from('cinemas')
      .select('id')
      .eq('name', c.name)
      .single();
    
    if (!existing) {
        const { error } = await supabase.from('cinemas').insert([c]);
        if (error) {
            console.error(`Failed to add ${c.name}:`, error);
        } else {
            console.log(`Added ${c.name} in ${c.city}`);
        }
    } else {
        console.log(`${c.name} already exists.`);
    }
  }
}

addCinemas().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
