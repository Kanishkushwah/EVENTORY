import { supabase } from "../config/supabase.js";

const mockEvents = [
    { id: 102, title: "Dunki", category: "Movies", venue: "Surat", price: 180, image_url: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@star-icon-202203010609.png,lx-24,ly-615,w-29,l-end:l-text,ie-OS4xLzEwICAzMTZLIFZvdGVz,fs-29,co-FFFFFF,ly-612,lx-70,pa-8_0_0_0,l-end/et00073677-yajymybpzu-portrait.jpg", date: "2024-01-15T00:00:00", description: "Shah Rukh Khan and Rajkumar Hirani unite for an emotional journey of friendship and dreams." },
    { id: 103, title: "Salaar: Part 1 - Ceasefire", category: "Movies", venue: "Surat", price: 200, image_url: "https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@star-icon-202203010609.png,lx-24,ly-615,w-29,l-end:l-text,ie-OS4xLzEwICAzMTZLIFZvdGVz,fs-29,co-FFFFFF,ly-612,lx-70,pa-8_0_0_0,l-end/et00073677-yajymybpzu-portrait.jpg", date: "2024-01-20T00:00:00", description: "Prabhas returns with an intense action saga directed by Prashanth Neel." },
    { id: 1, title: "India's Only Concrete Show 2024", category: "Business", venue: "Mumbai", price: 499, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBC6_SyhJOY8aUXrJ_VaXB_vT_iDTBUmeTEukkGCqMhDv_G88XVjQPUjI6lwXPq96UlyU1thwDxcu4NsfwLtH2I0GxesLvt2B6txbDHiW7bZqhCVzZMPRODG3d1kMwjTp7QPVqcqt91FUKXMe-shTBvTdqHY3tvmzz-0nhglwrACOIQeep3RxlQBPJCwzjWV6xAvvHNYKw5cT-ljJiY7_EECAPRNsusBidYQXTpD493V77cdIdUi6PXzJTASOh94hMCNMUuOd4wUgs", date: "2024-06-15T00:00:00", description: "Join the biggest gathering of construction professionals featuring the latest innovations in concrete technology." },
    { id: 2, title: "Sunburn Festival 2025", category: "Music", venue: "Goa", price: 2499, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-5rHDZ8M5GGVzvclyI4laXZPhS4nAfnTsmdmu5FE6gwLC6-rXBTyrlHbywyCjJRfk-sNgPoH_2PMsqVSH0ODBpSiuXuwOCp5rnfiaCxNA6NI_hLTxYRhOFeU1EyJEbLpLZNdo5Jhr-g1NHL10lgRgA-FnhtU_edUXup1CGq3luKsJX3HwC9R-lfq-GR63BzRMqjhCbzlV3AH7T5nnAVuVh36F2KHALadRMkVauwmeQ1x1gDCv5KGwX53UACgYZwWkKrhFWRxxoJ4", date: "2025-12-28T00:00:00", description: "Experience Asia's biggest electronic dance music festival. Get ready to feel the beat with top international DJs." },
    { id: 3, title: "IPL 2024: MI vs RCB", category: "Sports", venue: "Eden Gardens", price: 800, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJvRDTKzGrb8wZeUy2yo5-8UDx_CESTXq1iuJuYL166Q5pI35R8r1edhTmHt8JpddwrumyRlZKXIS1RANPvlf9P0bG0raONWeomtzAll_FZt_pC7zMQl57ZdjwcAnycmnSiwOIICRJZtWT_LBVrRff7Y9sMXE3PT87x5BUPG4OASpClyhKBHq-RfDApySOH072QG1i33ZHp9w0uA3_fWNOWsOwN3LRcWAdGrV_tLib7tEsBTp-C60EZZYYFRJAW8tu5cYAcz1NPFY", date: "2024-04-12T00:00:00", description: "The ultimate cricket rivalry! Watch Mumbai Indians take on Royal Challengers Bangalore in a thrilling T20 match." },
    { id: 4, title: "Laugh Riot: Standup Special", category: "Arts", venue: "Bangalore", price: 399, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8F37f_ZCtKxu76yDk45jqJ7zLIVovQIHH9OhXhJkvB6iKYhX1F1-H6rv_fOafUhRtrhKPMshRXFKWFbQFpB8s7apBFGmNPc6L68_OO9fRraklGP4F7plLJv9v8trTujyLqh1A1WjQUyAKMsIrsOCdbyBR1URJe-58BnvAlRRyZRZZPrdyCqlfCx1PQAvExmFwHXVcgtws9m08hOgmFFdke0k1hWpfp8JvOKPlWhog1IoqLXWkZD2cbjpCHy3gMlNhDE7_G5XTncs", date: "2024-05-20T00:00:00", description: "An evening of hilarious standup comedy featuring some of the country's best comedians." },
    { id: 5, title: "Digital Art Masterclass", category: "Arts", venue: "Delhi", price: 1299, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRLVa45R5oojqnHubsA7XDhOs8vANFip92o0Yhg4EhwwYCsTNKkf1jGhwnBwZ3AWMplmoNl4Jx6JW7qzOK5qiVJWe83ZzDDorkw9AuJDoV-RV9fhpIe7P2sWXTr-9dH0yBTKxphY1hj-aqEGV9ycOQisFLgWpCKZlKL0d5IANemo4KdxB7doDEOURbG2pWJCMWYeKYfcUaJqEZiD2YRaB2HnC1lCcSqITfr7qhUaAq3SW8r7-8DqdNbiRiCg1edYS4EpojAQbRUQ0", date: "2024-07-08T00:00:00", description: "Learn the secrets of digital painting from industry experts. Suitable for beginners and intermediates." },
    { id: 6, title: "Tech Startups Summit 2024", category: "Business", venue: "Hyderabad", price: 0, image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDsUeWu13WEVN7Szd6mkpBOCpwIgaRV06zAV5G1ZFMiS73PXtsQh6QfnxO-mU8ECFc8d70qzhdZRhFDnyDQlwbosRnHv2174vjH2Uq4aG1ZUGvNv2Cz_Ea0ptlyFOViwNqmyPkBxR0eYvOFjpXN8eSrGmBdoIh8yz7xg55QKyiJdZtZ-KJxR49S7G4p-IJUTHz_5iG6MjW8XGuHLqh-liNfwtduq3ZBDIjoBhvNoRVfcazUn_JXnqmuH7DTX7Pf9QXUT6KG_x2BdcY", date: "2024-09-10T00:00:00", description: "Network with founders, investors, and tech enthusiasts. Discover the next big thing in the startup world." }
];

export const EventModel = {
    async getAll() {
        try {
            const res = await supabase
                .from("events")
                .select("*")
                .order("id", { ascending: false });

            if (res.error) throw res.error;
            return res;
        } catch (e) {
            console.error("Supabase Database inaccessible. Returning mock events fallback:", e.message);
            return { data: mockEvents, error: null };
        }
    },

    async getById(id) {
        try {
            const res = await supabase
                .from("events")
                .select("*")
                .eq("id", id)
                .single();

            if (res.error) throw res.error;
            return res;
        } catch (e) {
            console.error("Supabase getById failed. Returning mock data if exists:", e.message);
            const mockData = mockEvents.find(event => String(event.id) === String(id));
            if (mockData) return { data: mockData, error: null };
            return { data: null, error: e };
        }
    },

    async create(eventData) {
        return await supabase
            .from("events")
            .insert(eventData)
            .select()
            .single();
    },

    async update(id, eventData) {
        return await supabase
            .from("events")
            .update(eventData)
            .eq("id", id)
            .select()
            .single();
    },

    async delete(id) {
        return await supabase
            .from("events")
            .delete()
            .eq("id", id);
    }
};