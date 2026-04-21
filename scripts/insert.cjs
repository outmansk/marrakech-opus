const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertVilla() {
  const property = {
    titre: "Villa Garden TR 1",
    type: "villa",
    services: ["location-longue-duree"],
    prix: 22000,
    prix_location_longue: 22000,
    devise: "MAD",
    surface_habitable: 150,
    surface_terrain: 700,
    chambres: 3,
    salles_de_bain: 3,
    description_courte: "Magnifique villa meublée avec piscine chauffée et jardin privé dans une résidence sécurisée.",
    description_longue: "Découvrez cette splendide Villa Garden TR 1, une oasis de tranquillité offrant des prestations de grand standing. D'une surface habitable de 150 m² érigée sur un somptueux terrain arboré de 700 m², cette propriété est louée entièrement meublée. Elle dévoile un espace de vie baigné de lumière comprenant un double salon avec cheminée s'ouvrant sur une magnifique piscine privée chauffée (8x4m). La villa dispose d'une cuisine parfaitement équipée et de 3 élégantes chambres en suite avec leurs propres salles de bain. L'ensemble est pensé pour votre confort et votre sécurité : climatisation réversible intégrale, internet fibre haut débit, arrosage automatique, équipements de vidéosurveillance à énergie solaire et résidence fermée 100% sécurisée. Le parfait compromis entre l'art de vivre de Marrakech et la plus haute modernité.",
    equipements: ["Piscine", "Jardin", "Climatisation", "Chauffage central", "Cuisine équipée", "Parking", "Gardiennage 24/7", "Internet Fibre", "Terrasse", "Cheminée"],
    photos: [
      "/assets/properties/villa-garden-tr1/1.jpg",
      "/assets/properties/villa-garden-tr1/2.jpg",
      "/assets/properties/villa-garden-tr1/3.jpg",
      "/assets/properties/villa-garden-tr1/4.jpg",
      "/assets/properties/villa-garden-tr1/5.jpg",
      "/assets/properties/villa-garden-tr1/6.jpg",
      "/assets/properties/villa-garden-tr1/7.jpg",
      "/assets/properties/villa-garden-tr1/8.jpg",
      "/assets/properties/villa-garden-tr1/9.jpg",
      "/assets/properties/villa-garden-tr1/10.jpg",
      "/assets/properties/villa-garden-tr1/11.jpg",
      "/assets/properties/villa-garden-tr1/12.jpg",
      "/assets/properties/villa-garden-tr1/13.jpg",
      "/assets/properties/villa-garden-tr1/14.jpg",
      "/assets/properties/villa-garden-tr1/15.jpg"
    ],
    photo_principale: "/assets/properties/villa-garden-tr1/1.jpg",
    statut: "publie"
  };

  const { data, error } = await supabase.from('properties_v2').insert([property]).select();
  
  if (error) {
    console.error("Error inserting data:", error.message);
  } else {
    console.log("Successfully inserted data:", data);
  }
}

insertVilla();
