// events-data.js - Centralized Event Database
const eventsDatabase = {
    // MOVIES CATEGORY - NEW!
    101: {
        id: 101,
        title: "Pushpa 2: The Rule",
        category: "movie",
        date: "NOW SHOWING",
        fullDate: "January 20, 2026",
        time: "Multiple Showtimes",
        location: "Surat",
        venue: "Select Theater",
        price: 150,
        image: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@star-icon-202203010609.png,lx-24,ly-615,w-29,l-end:l-text,ie-OC42LzEwICAzNjlLIFZvdGVz,fs-29,co-FFFFFF,ly-612,lx-70,pa-8_0_0_0,l-end/et00356724-jruwpnhzdg-portrait.jpg",
        description: "The epic conclusion to Pushpa's journey. Allu Arjun returns in this action-packed sequel.",
        fullDescription: "Pushpa 2: The Rule continues the story of Pushpa Raj's rise in the red sandalwood smuggling syndicate. With intense action sequences, powerful dialogues, and stellar performances, this sequel takes the franchise to new heights.",
        highlights: [
            "Allu Arjun in a career-defining role",
            "High-octane action sequences",
            "Chart-topping music",
            "Multiple language options available",
            "Premium sound and visual experience"
        ],
        artists: [
            { name: "Allu Arjun", role: "Lead Actor" },
            { name: "Rashmika Mandanna", role: "Lead Actress" },
            { name: "Fahadh Faasil", role: "Antagonist" },
            { name: "Sukumar", role: "Director" }
        ],
        duration: "3h 20min",
        genre: "Action/Drama",
        rating: "UA",
        language: ["Hindi", "Telugu", "Tamil"],
        theaters: [
            { id: "t1", name: "INOX VR Surat", location: "VR Mall, Dumas Road", distance: "2.3 km", formats: ["2D", "3D", "IMAX"] },
            { id: "t2", name: "PVR Rahul Raj Mall", location: "Piplod", distance: "3.1 km", formats: ["2D", "4DX"] },
            { id: "t3", name: "Cinepolis Central Mall", location: "Ghod Dod Road", distance: "4.5 km", formats: ["2D", "3D"] },
            { id: "t4", name: "Movietime Multiplexes", location: "Athwa", distance: "5.2 km", formats: ["2D"] }
        ],
        showtimes: {
            "t1": ["10:30 AM", "2:15 PM", "6:00 PM", "9:45 PM"],
            "t2": ["11:00 AM", "3:00 PM", "7:00 PM", "10:30 PM"],
            "t3": ["12:00 PM", "4:00 PM", "8:00 PM"],
            "t4": ["1:00 PM", "5:00 PM", "9:00 PM"]
        },
        tickets: [
            { type: "Normal", price: 150, description: "Standard seating", seatType: "normal" },
            { type: "Recliner", price: 280, description: "Premium recliner seats", seatType: "recliner" }
        ],
        seatPricing: {
            normal: 150,
            recliner: 280
        }
    },
    102: {
        id: 102,
        title: "Dunki",
        category: "movie",
        date: "NOW SHOWING",
        fullDate: "January 20, 2026",
        time: "Multiple Showtimes",
        location: "Surat",
        venue: "Select Theater",
        price: 180,
        image: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@star-icon-202203010609.png,lx-24,ly-615,w-29,l-end:l-text,ie-OS44LzEwICAyMDBLIFZvdGVz,fs-29,co-FFFFFF,ly-612,lx-70,pa-8_0_0_0,l-end/et00304730-fwbwbqkjka-portrait.jpg",
        description: "Shah Rukh Khan and Rajkumar Hirani unite for an emotional journey of friendship and dreams.",
        fullDescription: "Dunki is a heartwarming tale that explores the lives of people who take the illegal route to achieve their dreams. Directed by Rajkumar Hirani, this film combines humor, emotion, and social commentary.",
        highlights: [
            "Shah Rukh Khan's return to emotional cinema",
            "Rajkumar Hirani's trademark storytelling",
            "Beautiful cinematography",
            "Chart-topping music by Pritam",
            "Feel-good family entertainer"
        ],
        artists: [
            { name: "Shah Rukh Khan", role: "Lead Actor" },
            { name: "Taapsee Pannu", role: "Lead Actress" },
            { name: "Vicky Kaushal", role: "Supporting Role" },
            { name: "Rajkumar Hirani", role: "Director" }
        ],
        duration: "2h 45min",
        genre: "Drama/Comedy",
        rating: "U/A",
        language: ["Hindi", "English"],
        theaters: [
            { id: "t1", name: "INOX VR Surat", location: "VR Mall, Dumas Road", distance: "2.3 km", formats: ["2D"] },
            { id: "t2", name: "PVR Rahul Raj Mall", location: "Piplod", distance: "3.1 km", formats: ["2D"] },
            { id: "t3", name: "Cinepolis Central Mall", location: "Ghod Dod Road", distance: "4.5 km", formats: ["2D"] }
        ],
        showtimes: {
            "t1": ["11:00 AM", "2:30 PM", "6:30 PM", "10:00 PM"],
            "t2": ["10:45 AM", "3:15 PM", "7:15 PM"],
            "t3": ["12:30 PM", "4:30 PM", "8:30 PM"]
        },
        tickets: [
            { type: "Regular", price: 180, description: "Standard seating" },
            { type: "Premium", price: 280, description: "Recliner seats" },
            { type: "Couple Seat", price: 500, description: "2 seats together" }
        ]
    },
    103: {
        id: 103,
        title: "Salaar: Part 1 - Ceasefire",
        category: "movie",
        date: "NOW SHOWING",
        fullDate: "January 20, 2026",
        time: "Multiple Showtimes",
        location: "Surat",
        venue: "Select Theater",
        price: 200,
        image: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@star-icon-202203010609.png,lx-24,ly-615,w-29,l-end:l-text,ie-OS4xLzEwICAzMTZLIFZvdGVz,fs-29,co-FFFFFF,ly-612,lx-70,pa-8_0_0_0,l-end/et00073677-yajymybpzu-portrait.jpg",
        description: "Prabhas returns with an intense action saga directed by Prashanth Neel.",
        fullDescription: "Salaar is an action-packed thriller that showcases Prabhas in a never-seen-before avatar. From the director of KGF, this film promises raw action and gripping storytelling.",
        highlights: [
            "Prabhas in a powerful role",
            "Directed by Prashanth Neel (KGF)",
            "High-budget action sequences",
            "Pan-India release",
            "Background score by Ravi Basrur"
        ],
        artists: [
            { name: "Prabhas", role: "Lead Actor" },
            { name: "Prithviraj Sukumaran", role: "Lead Role" },
            { name: "Shruti Haasan", role: "Lead Actress" },
            { name: "Prashanth Neel", role: "Director" }
        ],
        duration: "2h 55min",
        genre: "Action/Thriller",
        rating: "A",
        language: ["Hindi", "Telugu", "Tamil", "Kannada"],
        theaters: [
            { id: "t1", name: "INOX VR Surat", location: "VR Mall, Dumas Road", distance: "2.3 km", formats: ["2D", "IMAX"] },
            { id: "t2", name: "PVR Rahul Raj Mall", location: "Piplod", distance: "3.1 km", formats: ["2D", "4DX"] },
            { id: "t3", name: "Cinepolis Central Mall", location: "Ghod Dod Road", distance: "4.5 km", formats: ["2D"] }
        ],
        showtimes: {
            "t1": ["10:00 AM", "1:30 PM", "5:30 PM", "9:30 PM"],
            "t2": ["11:30 AM", "3:30 PM", "7:30 PM"],
            "t3": ["12:00 PM", "4:00 PM", "8:00 PM"]
        },
        tickets: [
            { type: "Regular", price: 200, description: "Standard seating" },
            { type: "Premium", price: 300, description: "Premium seats" },
            { type: "Recliner", price: 450, description: "Full recliner experience" }
        ]
    },
    104: {
        id: 104,
        title: "12th Fail",
        category: "movie",
        date: "NOW SHOWING",
        fullDate: "January 20, 2026",
        time: "Multiple Showtimes",
        location: "Surat",
        venue: "Select Theater",
        price: 150,
        image: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@star-icon-202203010609.png,lx-24,ly-615,w-29,l-end:l-text,ie-OS42LzEwICAyNjBLIFZvdGVz,fs-29,co-FFFFFF,ly-612,lx-70,pa-8_0_0_0,l-end/et00348942-dsecsfdgqf-portrait.jpg",
        description: "An inspirational story based on the life of Manoj Kumar Sharma.",
        fullDescription: "12th Fail is a motivational drama that tells the true story of an IPS officer who overcame extreme poverty to achieve his dreams. This film is a testament to perseverance and determination.",
        highlights: [
            "Based on a true story",
            "Critically acclaimed performances",
            "Motivational and inspiring",
            "Realistic portrayal of struggles",
            "Award-winning direction"
        ],
        artists: [
            { name: "Vikrant Massey", role: "Lead Actor" },
            { name: "Medha Shankar", role: "Lead Actress" },
            { name: "Vidhu Vinod Chopra", role: "Director" },
            { name: "Anant Joshi", role: "Supporting Role" }
        ],
        duration: "2h 27min",
        genre: "Drama/Biography",
        rating: "U/A",
        language: ["Hindi"],
        theaters: [
            { id: "t2", name: "PVR Rahul Raj Mall", location: "Piplod", distance: "3.1 km", formats: ["2D"] },
            { id: "t3", name: "Cinepolis Central Mall", location: "Ghod Dod Road", distance: "4.5 km", formats: ["2D"] },
            { id: "t4", name: "Movietime Multiplexes", location: "Athwa", distance: "5.2 km", formats: ["2D"] }
        ],
        showtimes: {
            "t2": ["11:15 AM", "2:45 PM", "6:15 PM", "9:45 PM"],
            "t3": ["10:30 AM", "3:00 PM", "7:30 PM"],
            "t4": ["12:00 PM", "5:00 PM", "9:00 PM"]
        },
        tickets: [
            { type: "Regular", price: 150, description: "Standard seating" },
            { type: "Premium", price: 220, description: "Premium seats" }
        ]
    },
    1: {
        id: 1,
        title: "India's Only Concrete Show 2024",
        category: "business",
        date: "JUN 15",
        fullDate: "June 15, 2024",
        time: "10:00 AM",
        location: "Mumbai",
        venue: "Bombay Exhibition Centre",
        price: 499,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBC6_SyhJOY8aUXrJ_VaXB_vT_iDTBUmeTEukkGCqMhDv_G88XVjQPUjI6lwXPq96UlyU1thwDxcu4NsfwLtH2I0GxesLvt2B6txbDHiW7bZqhCVzZMPRODG3d1kMwjTp7QPVqcqt91FUKXMe-shTBvTdqHY3tvmzz-0nhglwrACOIQeep3RxlQBPJCwzjWV6xAvvHNYKw5cT-ljJiY7_EECAPRNsusBidYQXTpD493V77cdIdUi6PXzJTASOh94hMCNMUuOd4wUgs",
        description: "Join the biggest gathering of construction professionals featuring the latest innovations in concrete technology.",
        fullDescription: "India's premier concrete technology conference bringing together industry leaders, innovators, and professionals. Experience cutting-edge construction techniques, sustainable practices, and network with experts.",
        highlights: [
            "Latest concrete technology innovations",
            "Expert speaker sessions",
            "Live demonstrations",
            "Networking opportunities",
            "Industry exhibitions"
        ],
        artists: [
            { name: "Dr. Rajesh Kumar", role: "Keynote Speaker" },
            { name: "Sarah Williams", role: "Tech Expert" },
            { name: "Industry Panel", role: "Q&A Session" }
        ],
        tickets: [
            { type: "Standard Pass", price: 499, description: "Full day access" },
            { type: "VIP Pass", price: 1999, description: "VIP lounge + lunch" },
            { type: "Corporate", price: 4999, description: "Team of 5 + networking" }
        ]
    },
    2: {
        id: 2,
        title: "Sunburn Festival 2025",
        category: "music",
        date: "DEC 28",
        fullDate: "December 28, 2025",
        time: "6:00 PM",
        location: "Goa",
        venue: "Vagator Beach",
        price: 2499,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-5rHDZ8M5GGVzvclyI4laXZPhS4nAfnTsmdmu5FE6gwLC6-rXBTyrlHbywyCjJRfk-sNgPoH_2PMsqVSH0ODBpSiuXuwOCp5rnfiaCxNA6NI_hLTxYRhOFeU1EyJEbLpLZNdo5Jhr-g1NHL10lgRgA-FnhtU_edUXup1CGq3luKsJX3HwC9R-lfq-GR63BzRMqjhCbzlV3AH7T5nnAVuVh36F2KHALadRMkVauwmeQ1x1gDCv5KGwX53UACgYZwWkKrhFWRxxoJ4",
        description: "Experience Asia's biggest electronic dance music festival. Get ready to feel the beat with top international DJs.",
        fullDescription: "Sunburn Festival returns for its most spectacular edition yet! Get ready to dance under the stars with the world's top electronic music artists. This year's lineup features international headliners, cutting-edge production, multiple stages, and an atmosphere that will take your breath away.",
        highlights: [
            "World-renowned DJs and artists",
            "5 stages with different music genres",
            "State-of-the-art sound and lighting",
            "Food and beverage zones",
            "VIP lounges and exclusive areas"
        ],
        artists: [
            { name: "Martin Garrix", role: "Main Stage" },
            { name: "David Guetta", role: "Main Stage" },
            { name: "KSHMR", role: "Stage 2" },
            { name: "Nucleya", role: "Stage 3" },
            { name: "Ritviz", role: "Stage 4" }
        ],
        tickets: [
            { type: "General Entry", price: 2499, description: "Access to all stages" },
            { type: "VIP Pass", price: 5999, description: "VIP lounge + priority entry" },
            { type: "Platinum", price: 12999, description: "All access + meet & greet" }
        ]
    },
    3: {
        id: 3,
        title: "IPL 2024: MI vs RCB",
        category: "sports",
        date: "APR 12",
        fullDate: "April 12, 2024",
        time: "7:30 PM",
        location: "Wankhede",
        venue: "Wankhede Stadium",
        price: 800,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJvRDTKzGrb8wZeUy2yo5-8UDx_CESTXq1iuJuYL166Q5pI35R8r1edhTmHt8JpddwrumyRlZKXIS1RANPvlf9P0bG0raONWeomtzAll_FZt_pC7zMQl57ZdjwcAnycmnSiwOIICRJZtWT_LBVrRff7Y9sMXE3PT87x5BUPG4OASpClyhKBHq-RfDApySOH072QG1i33ZHp9w0uA3_fWNOWsOwN3LRcWAdGrV_tLib7tEsBTp-C60EZZYYFRJAW8tu5cYAcz1NPFY",
        description: "The ultimate cricket rivalry! Watch Mumbai Indians take on Royal Challengers Bangalore in a thrilling T20 match.",
        fullDescription: "Experience the electrifying atmosphere as two cricket giants clash at the iconic Wankhede Stadium. Mumbai Indians vs Royal Challengers Bangalore - a rivalry that defines IPL. Watch your favorite stars battle it out in this high-stakes T20 encounter.",
        highlights: [
            "Star-studded lineups",
            "World-class cricket action",
            "Food and beverage stalls",
            "Fan zones and activities",
            "Live commentary and replays"
        ],
        artists: [
            { name: "Rohit Sharma", role: "MI Captain" },
            { name: "Virat Kohli", role: "RCB Star" },
            { name: "Jasprit Bumrah", role: "MI Bowler" },
            { name: "Glenn Maxwell", role: "RCB All-rounder" }
        ],
        tickets: [
            { type: "General Stand", price: 800, description: "Standing area" },
            { type: "Premium Seats", price: 2500, description: "Covered seating" },
            { type: "Corporate Box", price: 15000, description: "Private box for 10" }
        ]
    },
    4: {
        id: 4,
        title: "Laugh Riot: Standup Special",
        category: "arts",
        date: "MAY 20",
        fullDate: "May 20, 2024",
        time: "8:00 PM",
        location: "Bangalore",
        venue: "Phoenix Marketcity Arena",
        price: 399,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8F37f_ZCtKxu76yDk45jqJ7zLIVovQIHH9OhXhJkvB6iKYhX1F1-H6rv_fOafUhRtrhKPMshRXFKWFbQFpB8s7apBFGmNPc6L68_OO9fRraklGP4F7plLJv9v8trTujyLqh1A1WjQUyAKMsIrsOCdbyBR1URJe-58BnvAlRRyZRZZPrdyCqlfCx1PQAvExmFwHXVcgtws9m08hOgmFFdke0k1hWpfp8JvOKPlWhog1IoqLXWkZD2cbjpCHy3gMlNhDE7_G5XTncs",
        description: "An evening of hilarious standup comedy featuring some of the country's best comedians.",
        fullDescription: "Get ready for a night of non-stop laughter! Laugh Riot brings together India's funniest comedians for an unforgettable comedy experience. Sharp wit, relatable humor, and side-splitting jokes guaranteed.",
        highlights: [
            "Multiple comedy acts",
            "Interactive segments",
            "Photo opportunities",
            "Merchandise available",
            "Food and drinks included"
        ],
        artists: [
            { name: "Zakir Khan", role: "Headliner" },
            { name: "Biswa Kalyan Rath", role: "Featured Act" },
            { name: "Kenny Sebastian", role: "Special Guest" },
            { name: "Neeti Palta", role: "Opening Act" }
        ],
        tickets: [
            { type: "Regular", price: 399, description: "Standard seating" },
            { type: "Premium", price: 799, description: "Front row seats" },
            { type: "VIP", price: 1499, description: "Meet & greet included" }
        ]
    },
    5: {
        id: 5,
        title: "Digital Art Masterclass",
        category: "arts",
        date: "JUL 08",
        fullDate: "July 08, 2024",
        time: "2:00 PM",
        location: "Delhi",
        venue: "India Habitat Centre",
        price: 1299,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRLVa45R5oojqnHubsA7XDhOs8vANFip92o0Yhg4EhwwYCsTNKkf1jGhwnBwZ3AWMplmoNl4Jx6JW7qzOK5qiVJWe83ZzDDorkw9AuJDoV-RV9fhpIe7P2sWXTr-9dH0yBTKxphY1hj-aqEGV9ycOQisFLgWpCKZlKL0d5IANemo4KdxB7doDEOURbG2pWJCMWYeKYfcUaJqEZiD2YRaB2HnC1lCcSqITfr7qhUaAq3SW8r7-8DqdNbiRiCg1edYS4EpojAQbRUQ0",
        description: "Learn the secrets of digital painting from industry experts. Suitable for beginners and intermediates.",
        fullDescription: "Transform your artistic skills with this comprehensive digital art workshop. Learn industry-standard techniques from award-winning digital artists. Covers everything from basic tools to advanced illustration methods.",
        highlights: [
            "Hands-on training sessions",
            "Industry expert instructors",
            "Certificate of completion",
            "Free digital art toolkit",
            "Networking with artists"
        ],
        artists: [
            { name: "Priya Sharma", role: "Lead Instructor" },
            { name: "Alex Johnson", role: "Animation Expert" },
            { name: "Ravi Verma", role: "Concept Artist" }
        ],
        tickets: [
            { type: "Workshop Pass", price: 1299, description: "Full day workshop" },
            { type: "Premium", price: 2499, description: "Includes software license" },
            { type: "Master Class", price: 4999, description: "1-on-1 mentoring" }
        ]
    },
    6: {
        id: 6,
        title: "Tech Startups Summit 2024",
        category: "business",
        date: "SEP 10",
        fullDate: "September 10, 2024",
        time: "9:00 AM",
        location: "Hyderabad",
        venue: "HITEC City Convention Center",
        price: 0,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsUeWu13WEVN7Szd6mkpBOCpwIgaRV06zAV5G1ZFMiS73PXtsQh6QfnxO-mU8ECFc8d70qzhdZRhFDnyDQlwbosRnHv2174vjH2Uq4aG1ZUGvNv2Cz_Ea0ptlyFOViwNqmyPkBxR0eYvOFjpXN8eSrGmBdoIh8yz7xg55QKyiJdZtZ-KJxR49S7G4p-IJUTHz_5iG6MjW8XGuHLqh-liNfwtduq3ZBDIjoBhvNoRVfcazUn_JXnqmuH7DTX7Pf9QXUT6KG_x2BdcY",
        description: "Network with founders, investors, and tech enthusiasts. Discover the next big thing in the startup world.",
        fullDescription: "Join India's premier tech startup summit connecting entrepreneurs, investors, and innovators. Featuring keynote speeches, panel discussions, pitch competitions, and unparalleled networking opportunities.",
        highlights: [
            "Startup pitch competition",
            "Investor networking sessions",
            "Keynote by industry leaders",
            "Exhibition area",
            "Free entry for all"
        ],
        artists: [
            { name: "Kunal Shah", role: "Keynote Speaker" },
            { name: "Ghazal Alagh", role: "Panel Discussion" },
            { name: "VC Panel", role: "Funding Insights" }
        ],
        tickets: [
            { type: "Free Entry", price: 0, description: "Open to all" },
            { type: "Exhibitor Pass", price: 5000, description: "Booth space included" },
            { type: "VIP Access", price: 2999, description: "Private investor meetings" }
        ]
    }
};

// Helper function to get event by ID
function getEventById(id) {
    return eventsDatabase[id];
}

// Helper function to get all events
function getAllEvents() {
    return Object.values(eventsDatabase);
}

// Helper function to filter events by category
function getEventsByCategory(category) {
    return Object.values(eventsDatabase).filter(event => event.category === category);
}

// Store current event for booking flow
function setCurrentEvent(eventId) {
    localStorage.setItem('currentEventId', eventId);
    const event = getEventById(eventId);
    if (event) {
        localStorage.setItem('currentEventData', JSON.stringify(event));
    }
}

// Get current event from storage
function getCurrentEvent() {
    const eventData = localStorage.getItem('currentEventData');
    return eventData ? JSON.parse(eventData) : null;
}