import { supabase } from './src/config/supabase.js';

async function addCinemas() {
    const cinemas = [
        // Hyderabad
        { name: "PVR Inorbit", location: "Madhapur", address: "Inorbit Mall, Hyderabad", city: "Hyderabad", total_screens: 6 },
        { name: "INOX GVK One", location: "Banjara Hills", address: "GVK One Mall, Hyderabad", city: "Hyderabad", total_screens: 5 },
        { name: "Cinepolis CCPL", location: "Malkajgiri", address: "CCPL Mall, Hyderabad", city: "Hyderabad", total_screens: 5 },

        // Pune
        { name: "PVR Phoenix Marketcity", location: "Viman Nagar", address: "Phoenix Marketcity, Pune", city: "Pune", total_screens: 7 },
        { name: "INOX Amanora", location: "Hadapsar", address: "Amanora Mall, Pune", city: "Pune", total_screens: 6 },
        { name: "Cinepolis Seasons", location: "Magarpatta", address: "Seasons Mall, Pune", city: "Pune", total_screens: 5 },

        // Chennai
        { name: "PVR VR Mall Chennai", location: "Anna Nagar", address: "VR Mall, Chennai", city: "Chennai", total_screens: 8 },
        { name: "INOX Citi Centre", location: "Mylapore", address: "Chennai Citi Centre, Chennai", city: "Chennai", total_screens: 4 },
        { name: "SPI Escape", location: "Royapettah", address: "Express Avenue, Chennai", city: "Chennai", total_screens: 6 },

        // Ahmedabad
        { name: "PVR Acropolis", location: "Thaltej", address: "Acropolis Mall, Ahmedabad", city: "Ahmedabad", total_screens: 5 },
        { name: "INOX Himalaya", location: "Drive In Road", address: "Himalaya Mall, Ahmedabad", city: "Ahmedabad", total_screens: 4 },
        { name: "Cinepolis AlphaOne", location: "Vastrapur", address: "AlphaOne Mall, Ahmedabad", city: "Ahmedabad", total_screens: 6 },

        // Jaipur
        { name: "INOX Pink Square", location: "Adarsh Nagar", address: "Pink Square Mall, Jaipur", city: "Jaipur", total_screens: 4 },
        { name: "PVR Mall of Jaipur", location: "Vaishali Nagar", address: "Mall of Jaipur, Jaipur", city: "Jaipur", total_screens: 5 },
        { name: "Cinepolis Triton", location: "Jhotwara", address: "Triton Mega Mall, Jaipur", city: "Jaipur", total_screens: 4 },

        // Chandigarh
        { name: "PVR Elante", location: "Industrial Area", address: "Elante Mall, Chandigarh", city: "Chandigarh", total_screens: 8 },
        { name: "INOX Dhillon", location: "Zirakpur", address: "Dhillon Plaza, Chandigarh", city: "Chandigarh", total_screens: 4 },
        { name: "Cinepolis TDI", location: "Sector 17", address: "TDI Mall, Chandigarh", city: "Chandigarh", total_screens: 5 },

        // Lucknow
        { name: "PVR Phoenix Palassio", location: "Gomti Nagar", address: "Phoenix Palassio, Lucknow", city: "Lucknow", total_screens: 7 },
        { name: "INOX Riverside", location: "Gomti Nagar", address: "Riverside Mall, Lucknow", city: "Lucknow", total_screens: 4 },
        { name: "Cinepolis One Awadh", location: "Gomti Nagar", address: "One Awadh Center, Lucknow", city: "Lucknow", total_screens: 5 }
    ];

    const newCinemasIds = [];

    for (const c of cinemas) {
        const { data: existing } = await supabase.from('cinemas').select('id').eq('name', c.name).single();
        if (!existing) {
            const { data, error } = await supabase.from('cinemas').insert([c]).select();
            if (error) console.error("Failed to add", c.name, error);
            else {
                console.log("Added", c.name, "in", c.city);
                if (data && data[0]) newCinemasIds.push(data[0].id);
            }
        } else {
            console.log(c.name, "already exists");
        }
    }

    if (newCinemasIds.length > 0) {
        console.log("Generating showtimes for the new cinemas...");
        const { data: movies } = await supabase.from('events').select('id, price').eq('category', 'Movies');
        const { data: newCinemas } = await supabase.from('cinemas').select('id').in('id', newCinemasIds);

        const newShowtimes = [];
        for (const movie of movies) {
            for (let i = 0; i < 5; i++) {
                const d = new Date();
                d.setDate(d.getDate() + i);
                const ds = d.toISOString().split('T')[0];

                for (const c of newCinemas) {
                    const basePrice = movie.price || 200;
                    newShowtimes.push({ event_id: movie.id, cinema_id: c.id, show_date: ds, show_time: '10:00 AM', screen_number: 1, available_seats: 100, price: basePrice });
                    newShowtimes.push({ event_id: movie.id, cinema_id: c.id, show_date: ds, show_time: '02:30 PM', screen_number: 2, available_seats: 120, price: basePrice + 50 });
                    newShowtimes.push({ event_id: movie.id, cinema_id: c.id, show_date: ds, show_time: '07:00 PM', screen_number: 1, available_seats: 100, price: basePrice + 100 });
                }
            }
        }
        // Insert in chunks
        const chunkSize = 1000;
        for (let i = 0; i < newShowtimes.length; i += chunkSize) {
            const chunk = newShowtimes.slice(i, i + chunkSize);
            const { error } = await supabase.from('movie_showtimes').insert(chunk);
            if (error) console.error("Error inserting chunk:", error);
        }
        console.log(`Inserted ${newShowtimes.length} showtimes for new cinemas.`);
    } else {
        console.log("No new cinemas added.");
    }
}

addCinemas().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
