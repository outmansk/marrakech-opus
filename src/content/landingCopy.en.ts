import type { LandingCopy, LandingId } from "./landings";

// Search landing page texts, in English. Same rules as the French reference:
// no invented market figures; legal and tax points refer readers to a notary.

const copy: Record<LandingId, LandingCopy> = {
  vente: {
    title: "Property for sale in Marrakech: villas, houses, riads",
    description: "Villas, houses and riads for sale in Marrakech: prices shown, property photos and support from the viewing to signing at the notary.",
    eyebrow: "Buy in Marrakech",
    h1: "Property for sale in Marrakech",
    answer: "Live In Marrakech offers property for sale in and around Marrakech, depending on availability: villas, houses, riads. We support buyers, Moroccan residents or not, from the viewing to signing at the notary.",
    sections: [
      {
        heading: "What kind of property to buy in Marrakech?",
        paragraphs: [
          "It depends first on how you want to live. Villas, usually with a garden and pool, are mostly on the outskirts: the Palmeraie, the Fez road, the Ourika road and the Amizmiz road. Apartments are concentrated in modern districts such as Gueliz, Hivernage and Agdal, and in gated residences with a shared pool.",
          "The riad, a traditional house built around an inner courtyard, is the signature of the medina, ideal if you want to live in the historic centre or open a guesthouse. Land lets you build a home to your own design, as long as you check carefully what the zoning allows.",
        ],
      },
      {
        heading: "How buying works in Morocco",
        paragraphs: [
          "Once you have agreed on a price, a purchase usually happens in two steps: a preliminary sale agreement with a deposit, then the final deed. Deeds are drawn up by a notary (or by adouls), and for titled property the sale is registered at the Land Registry (Conservation foncière).",
          "Before committing, ask for the land title certificate: it shows the owner, the surface area and any mortgage or encumbrance. Your notary will give you a written breakdown of the costs (registration duties, land registry fees, notary fees). These depend on the property and your situation, so we leave the figures to the notary.",
        ],
      },
      {
        heading: "Buying as a foreigner or a Moroccan living abroad",
        paragraphs: [
          "As a general rule, foreigners can buy an apartment, a villa or a riad in Morocco outright, without being resident. Agricultural land follows specific rules that a notary should check case by case.",
          "If you fund the purchase from abroad, pay through the banking system and keep the foreign-currency transfer records: they are required to repatriate the capital when you sell later. Your bank and notary will confirm the current rules.",
        ],
      },
      {
        heading: "How we work",
        paragraphs: [
          "Each listing shows photos of the property and its price. You can arrange a viewing on WhatsApp, in person or by video, and we then prepare the file with your notary until the keys are handed over.",
          "Can’t see the right property? Tell us your budget, preferred area and number of bedrooms, and we will send you a selection, including properties that are not online yet.",
        ],
      },
    ],
    faq: [
      { q: "Can foreigners buy property in Marrakech?", a: "Yes. As a general rule, foreigners can buy an apartment, a villa or a riad outright, without a residence permit. Agricultural land follows specific rules: have each case checked by a notary." },
      { q: "Who drafts the deed of sale in Morocco?", a: "A notary or adouls. For titled property, the sale is then registered at the Land Registry, which makes the transfer of ownership official." },
      { q: "How much are the buying costs?", a: "Mainly registration duties, land registry fees and notary fees. The amount depends on the price and the type of property: ask your notary for a written breakdown before signing." },
      { q: "Can I view a property remotely?", a: "Yes. We can do a live video viewing on WhatsApp, then arrange an in-person visit when you come to Marrakech." },
      { q: "Is the listed price negotiable?", a: "The listed price is the owner’s asking price. There is sometimes room to negotiate; we advise you after the viewing, depending on the property and the local market." },
    ],
    areas: ["Palmeraie", "Gueliz", "Hivernage", "Medina", "Route de l'Ourika", "Route de Fes", "Agdal"],
  },

  "vente-villas": {
    title: "Villa for sale in Marrakech with pool and garden",
    description: "Villas for sale in Marrakech on the Fez road and the Sidi Rahal road: pool, garden, photos and price shown on every listing.",
    eyebrow: "For sale · Villas",
    h1: "Villas for sale in Marrakech",
    answer: "Our villas for sale in Marrakech are on the outskirts of the city, on the Fez road and the Sidi Rahal road, with a garden and a private pool. Every listing shows the price, photos and floor areas.",
    sections: [
      {
        heading: "Where to buy a villa in Marrakech?",
        paragraphs: [
          "The Palmeraie, north-east of the city, is the historic address for large villas: mature gardens, quiet surroundings, golf courses nearby and quick access to the centre. The Fez road continues in the same spirit, with large estates often covering several thousand square metres.",
          "To the east, the Sidi Rahal road offers quiet villas with no overlooking neighbours, some with a panoramic view of the Atlas.",
        ],
      },
      {
        heading: "What to check during a viewing",
        paragraphs: [
          "Beyond falling in love with the place, check the legal situation (land title, plot size, buildings matching the permit), year-round car access, the water supply (mains or well) and the condition of the pool and electrical installation.",
          "Also budget for upkeep: garden, pool, security. For a large property, the yearly running cost matters as much as the purchase price. We pass on everything the owner tells us and help you ask the right questions.",
        ],
      },
      {
        heading: "Buying to live in or to rent out",
        paragraphs: [
          "Many buyers do both: they use the villa part of the year and rent it out the rest of the time. Some villas in our catalogue are offered both for sale and for rent. If you plan holiday lets, look into the required permits and taxation before you buy.",
        ],
      },
    ],
    faq: [
      { q: "Which area is best to buy a villa in Marrakech?", a: "Our villas for sale are on the Fez road for large, quiet properties, and on the Sidi Rahal road for Atlas views with no overlooking neighbours. The list above shows the properties available today." },
      { q: "Are villas sold furnished?", a: "It depends on the owner. Some villas are sold furnished and equipped, others empty; this is shown on each listing or confirmed on request." },
      { q: "Which documents should I check before buying a villa?", a: "The land title certificate, the cadastral plan, the building permit and the certificate of occupancy, and that there is no mortgage. Your notary checks these before signing." },
      { q: "Can I rent out my villa when I’m not there?", a: "Yes. Long-term rental is the simplest to set up. Holiday lets require permits and declaring the income: look into it before buying." },
      { q: "How can I view a villa from abroad?", a: "We organise a live video viewing on WhatsApp and send you the available documents, then an in-person visit during your stay." },
    ],
    areas: ["Palmeraie", "Route de Fes", "Route de l'Ourika", "Route d'Amizmiz", "Hivernage", "Targa", "Agdal"],
  },

  "vente-appartements": {
    title: "Apartment for sale in Marrakech",
    description: "Looking to buy an apartment in Marrakech? Tell us your budget and preferred area and we will send you a tailored selection.",
    eyebrow: "For sale · Apartments",
    h1: "Apartments for sale in Marrakech",
    answer: "Apartments for sale in Marrakech are mainly in Gueliz, Hivernage and Agdal, and in gated residences with a pool on the outskirts. As a general rule, foreigners can buy an apartment outright.",
    sections: [
      {
        heading: "Where to buy an apartment",
        paragraphs: [
          "Gueliz, the new town, gathers shops, cafés, restaurants and services: the choice for those who want to do everything on foot. Hivernage, between Gueliz and the medina, is more residential and upmarket, with many hotels and recent buildings.",
          "Agdal, south of the medina, and areas such as Targa or Chrifia offer newer residences, often gated and guarded, with a shared pool and parking. Prices there are generally more affordable than in the centre.",
        ],
      },
      {
        heading: "New, off-plan or resale",
        paragraphs: [
          "When buying off-plan (VEFA), payments are staged as construction progresses. Check the developer’s track record, the guarantees in the contract and the delivery date. For a resale apartment, look at the building’s condition, the service charges and the residence rules.",
          "In every case, ask for the apartment’s land title (each unit normally has its own) and the status of the building management. Your notary checks these before the final deed.",
        ],
      },
      {
        heading: "Live in it or invest",
        paragraphs: [
          "A well-located apartment is easy to rent out year-round to professionals, students or expats, and it is often the simplest investment to manage from abroad. We can also help you find a tenant once the purchase is complete.",
        ],
      },
    ],
    faq: [
      { q: "What is the best area to buy an apartment in Marrakech?", a: "Gueliz for neighbourhood life and shops, Hivernage for an upmarket, quiet setting, Agdal or Targa for recent residences with a pool at often more affordable prices." },
      { q: "Can a foreigner buy an apartment in Marrakech?", a: "Yes. As a general rule, foreigners can buy an apartment outright, without being resident. The notary checks the file before signing." },
      { q: "What is VEFA (off-plan)?", a: "Buying a home before it is built. The price is paid in stages as construction progresses, and the contract must set out the guarantees and delivery date." },
      { q: "Are there service charges?", a: "Yes, most residences have a management company that handles upkeep, security and the pool. Ask for the yearly charges before making an offer." },
      { q: "Can I buy an apartment to rent it out?", a: "Yes. Long-term rental is the easiest to manage. For short-term rental, check the permits and the residence rules, which may forbid it." },
    ],
    areas: ["Gueliz", "Hivernage", "Agdal", "Targa", "Chrifia"],
  },

  "vente-riads": {
    title: "Riad for sale in Marrakech with pool",
    description: "Riad for sale in Marrakech with a pool and patio. Land title, access, renovation: what to check before buying a riad.",
    eyebrow: "For sale · Riads",
    h1: "Riads for sale in Marrakech",
    answer: "A riad is a traditional Moroccan house built around an inner courtyard, often with a fountain or a pool. Before buying, check above all that the riad has a land title, then look at car access and the condition of the structure.",
    sections: [
      {
        heading: "Living in a riad",
        paragraphs: [
          "Behind a discreet façade, a riad opens onto a planted courtyard, sometimes with a pool, onto which the living rooms and bedrooms open. A roof terrace often completes the house. It is an inward-looking way of life, calm and private.",
          "Visit at different times of day to judge the light, noise and access, which vary a lot from one riad to another.",
        ],
      },
      {
        heading: "What to check before buying",
        paragraphs: [
          "Legal status is essential. Some older properties are still held under a “melkia” (traditional adoul deed) without a land title. Prefer a titled riad, or have your notary complete the registration before the sale.",
          "Also check car access, the structure, damp and the roof terrace’s waterproofing. Work on this type of building may require permits: look into it before buying a riad that needs renovation.",
        ],
      },
      {
        heading: "Private home or guesthouse",
        paragraphs: [
          "Many riads are run as guesthouses. If that is your plan, tourist operation requires specific permits and a classification: check whether the riad already has them and what it would take to obtain them.",
        ],
      },
    ],
    faq: [
      { q: "What is a riad?", a: "A traditional Moroccan house built around an inner, often planted courtyard, with rooms opening onto it and a roof terrace." },
      { q: "Why does the land title matter so much for a riad?", a: "The land title guarantees ownership and surface area, recorded at the Land Registry. A property held only under a “melkia” is riskier and must be registered, which takes time." },
      { q: "Can a foreigner buy a riad?", a: "Yes. As a general rule, foreigners can buy a riad outright. The notary checks the property’s status and chain of ownership before signing." },
      { q: "Can I renovate a riad freely?", a: "Not always: work may require permits and must respect the character of the building. Look into it before buying if the riad needs work." },
      { q: "Can a riad become a guesthouse?", a: "Yes, but tourist activity requires permits and a classification. Check whether the riad already operates legally, or what it would take." },
    ],
    areas: [],
  },

  "vente-maisons": {
    title: "House for sale in Marrakech",
    description: "Houses for sale in and around Marrakech, including a traditional house with a garden in Ennakhil (Palmeraie). In-person or video viewings.",
    eyebrow: "For sale · Houses",
    h1: "Houses for sale in Marrakech",
    answer: "In Marrakech, houses for sale are detached homes that are simpler or more compact than a villa: houses with a garden on the outskirts, as in the Palmeraie, or town houses in residential areas.",
    sections: [
      {
        heading: "House or villa: what’s the difference?",
        paragraphs: [
          "“Villa” usually means an upmarket detached home on a larger plot, often with a pool. “House” covers a wider range: houses with a garden but no pool, town houses on two or three floors, homes within residential complexes.",
          "For the same budget, a house often offers more living space than a villa in the same area, with more reasonable upkeep costs.",
        ],
      },
      {
        heading: "What to check",
        paragraphs: [
          "As with any purchase: land title, buildings matching the permit, no mortgage. For a house with a garden, look at the water supply and orientation; for a town house, the neighbourhood and parking.",
          "If you plan to extend or add a pool, first ask what the local zoning rules allow.",
        ],
      },
    ],
    faq: [
      { q: "What is the difference between a house and a villa in Marrakech?", a: "A villa is generally larger, on a bigger plot and often with a pool. A house covers simpler or more compact detached homes, with or without a garden." },
      { q: "Can I add a pool to a house?", a: "Often, but it depends on the plot and the zoning rules. Ask for a planning information note before planning work." },
      { q: "Can a foreigner buy a house in Marrakech?", a: "Yes, as a general rule, excluding agricultural land. The notary checks the property’s status before signing." },
      { q: "Do you have houses that aren’t online?", a: "Yes, some owners prefer discretion. Tell us what you are looking for and we will send you matching properties." },
    ],
    areas: ["Palmeraie", "Targa", "Agdal", "Route de l'Ourika"],
  },

  "vente-terrains": {
    title: "Land for sale in Marrakech",
    description: "Buying land in Marrakech: planning note, land title, utilities. Describe your project and we will search for you.",
    eyebrow: "For sale · Land",
    h1: "Land for sale in Marrakech",
    answer: "Buying land in Marrakech lets you build a villa to your own design. Before any purchase, ask the Urban Agency for the planning information note to know what can be built, and check the land title. Agricultural land follows specific rules for foreign buyers.",
    sections: [
      {
        heading: "Where to find land around Marrakech",
        paragraphs: [
          "Large plots are on the outskirts: the Palmeraie and the Fez, Ourika and Amizmiz roads. Closer to the city, subdivisions offer serviced lots of a more modest size, with precise building rules.",
        ],
      },
      {
        heading: "Essential checks",
        paragraphs: [
          "The planning information note (note de renseignements urbanistiques), issued by the Marrakech Urban Agency, states the plot’s zone and what is allowed there: height, buildable area, setbacks, use. Without it, you cannot know whether your project is feasible.",
          "Also check the land title and boundaries, road access and utilities: water, electricity, sewage. Connecting an isolated plot can be expensive and slow.",
          "For foreign buyers, acquiring agricultural land is regulated: depending on the plot, a certificate of non-agricultural use may be needed. Have a notary check this before committing.",
        ],
      },
      {
        heading: "Building your home",
        paragraphs: [
          "Once the land is bought, the project goes through an architect and a building permit application. Allow time for studies and permits in your schedule. We can put you in touch with local professionals.",
        ],
      },
    ],
    faq: [
      { q: "What is the planning information note?", a: "A document issued by the Urban Agency stating a plot’s zone and the building rules that apply. It is the first document to request before buying." },
      { q: "Can a foreigner buy land in Morocco?", a: "Building land within urban areas, yes as a general rule. Agricultural land follows specific rules for foreigners: a notary must check each case." },
      { q: "What is serviced land?", a: "A plot connected, or ready to be connected, to roads, water, electricity and sewage. Unserviced land costs less but requires connection work." },
      { q: "How long does a building permit take?", a: "It depends on the project and the municipality. Allow several months between the architect’s studies and obtaining the permit." },
    ],
    areas: ["Palmeraie", "Route de Fes", "Route de l'Ourika", "Route d'Amizmiz"],
  },

  location: {
    title: "Long-term rentals in Marrakech: villas & apartments",
    description: "Villas and apartments for long-term rent in Marrakech, furnished or not: 1-year lease, monthly rent shown, in-person or video viewings.",
    eyebrow: "Rent by the year",
    h1: "Long-term rentals in Marrakech",
    answer: "Live In Marrakech rents villas and apartments by the year in and around Marrakech, furnished or unfurnished, for expats, families, retirees, remote workers and Moroccan residents or Moroccans living abroad. The lease is one year minimum, the monthly rent is shown on each listing and a passport or national ID card is all you need to rent. You can view homes in person or by video on WhatsApp.",
    sections: [
      {
        heading: "Renting an apartment or a villa",
        paragraphs: [
          "Apartments are mostly rented in Gueliz, Hivernage, Agdal and gated residences with a pool. They suit professionals, couples and anyone who wants to be close to shops.",
          "Villas, usually on the outskirts, offer a garden, a pool and peace and quiet, which appeals to families and remote workers. You will need a car for daily trips.",
        ],
      },
      {
        heading: "How a long-term rental works",
        paragraphs: [
          "After the viewing, a written lease is signed between landlord and tenant; residential leases are governed by Law No. 67-12. The security deposit (one month’s rent for our properties) and the first month are paid on signing.",
          "Have your passport or ID and proof of income ready. A check-in inventory, ideally with photos, is done when you move in and out.",
        ],
      },
      {
        heading: "Furnished or unfurnished",
        paragraphs: [
          "Most expats choose a furnished home to settle in quickly. Unfurnished rentals are often cheaper and suit those staying several years with their own furniture. Each listing details the amenities; ask us for the full furniture inventory if needed.",
        ],
      },
    ],
    faq: [
      { q: "What documents do I need to rent in Marrakech?", a: "An ID or passport, and usually proof of income or a guarantee. The landlord may ask for additional documents." },
      { q: "How much is the security deposit?", a: "For our properties, the security deposit is one month’s rent, furnished or unfurnished. It is written into the lease." },
      { q: "Are utilities included in the rent?", a: "It depends on the property. Water, electricity and internet are usually paid by the tenant; residence charges may or may not be included. The listing or the lease specifies this." },
      { q: "Can I rent remotely before arriving in Morocco?", a: "Yes. We do a video viewing on WhatsApp and prepare the lease; signing and the check-in inventory take place when you arrive." },
      { q: "How long is a long-term lease?", a: "Usually one year, renewable, but other durations can be agreed with the landlord." },
    ],
    areas: ["Gueliz", "Hivernage", "Agdal", "Palmeraie", "Targa", "Route de Fes", "Route de l'Ourika"],
  },

  "location-appartements": {
    title: "Long-term apartment rental in Marrakech, furnished or not",
    description: "Apartments for long-term rent in Marrakech, in Chrifia or at the Prestigia golf estate: monthly rent shown, 1-year lease, ID is all you need.",
    eyebrow: "Long-term rental · Apartments",
    h1: "Apartments for long-term rent in Marrakech",
    answer: "Live In Marrakech offers apartments for long-term rent in Marrakech, for expats, couples, remote workers and Moroccan residents or Moroccans living abroad who want a home that is easy to live in day to day. The lease is one year minimum, the monthly rent is shown on each listing and a passport or national ID card is all you need. You can view homes in person or by video on WhatsApp.",
    sections: [
      {
        heading: "Which area to rent in?",
        paragraphs: [
          "Gueliz is the modern centre: shops, cafés, restaurants, gyms and services within walking distance. Hivernage is calmer and more residential, halfway between Gueliz and the medina. Agdal, further south, offers recent residences with parking and a pool.",
          "Areas such as Targa or Chrifia often have lower rents, with slightly longer trips to the centre. Gated residences on the outskirts appeal to families for their green spaces and security.",
        ],
      },
      {
        heading: "Furnished apartments by the year",
        paragraphs: [
          "A furnished apartment lets you move in with just a suitcase: equipped kitchen, bedding, appliances. It is the most common choice for expats and people on assignments lasting months or years.",
          "During the viewing, go through the furniture and appliances, check the air conditioning and heating (winter nights are cool in Marrakech) and the internet connection if you work from home.",
        ],
      },
      {
        heading: "Lease and costs",
        paragraphs: [
          "The written lease sets out the rent, duration, security deposit and who pays which charges. Water, electricity and internet are usually paid by the tenant; residence charges (management, security, pool) may or may not be included in the rent.",
        ],
      },
    ],
    faq: [
      { q: "Which area should I choose to rent an apartment in Marrakech?", a: "Gueliz to do everything on foot, Hivernage for calm and an upmarket setting, Agdal for recent residences with a pool, Targa or Chrifia for often more affordable rents." },
      { q: "Can I rent a furnished apartment for a year?", a: "Yes, it is the most common option for expats. Each listing shows its amenities, and we can send you the furniture inventory." },
      { q: "Does the listed rent include charges?", a: "The listed rent is monthly. Residence charges may or may not be included; water, electricity and internet are usually extra. This is confirmed before signing the lease." },
      { q: "Do I need a car if I live in Gueliz?", a: "Not necessarily: Gueliz and Hivernage work well on foot and by taxi. On the outskirts, a car becomes almost essential." },
      { q: "How long does it take to find an apartment?", a: "If a listed property suits you, a viewing can happen within days. Otherwise, describe what you need and we will send you a selection." },
    ],
    areas: ["Gueliz", "Hivernage", "Agdal", "Targa", "Chrifia"],
  },

  "location-villas": {
    title: "Long-term villa rental in Marrakech with private pool",
    description: "Villas with a pool for long-term rent in Marrakech, on the Fez road and the Sidi Rahal road: monthly rent shown, 1-year lease minimum.",
    eyebrow: "Long-term rental · Villas",
    h1: "Villas for long-term rent in Marrakech",
    answer: "Live In Marrakech rents villas with a garden and pool around Marrakech by the year, for families, retirees, remote workers and Moroccan residents or Moroccans living abroad who want space and calm. The lease is one year minimum, the monthly rent is shown on each listing and a passport or national ID card is all you need. You can view homes in person or by video on WhatsApp.",
    sections: [
      {
        heading: "Where to rent a villa in Marrakech?",
        paragraphs: [
          "The Palmeraie combines large gardens, quiet and closeness to the city. The Fez road offers big estates, sometimes on several hectares. To the south, the Ourika and Amizmiz roads offer recent villas with views of the Atlas.",
          "The further from the centre, the more space you get… and the more essential a car becomes: think about trips to school, work or the airport.",
        ],
      },
      {
        heading: "What a villa rental includes",
        paragraphs: [
          "Depending on the property, garden and pool maintenance, security or household staff may be included in the rent or paid by you. Have it written into the lease, along with who pays the water and electricity bills, which can be significant with a pool.",
          "Also check heating for winter, air conditioning for summer and the internet connection if you work from home.",
        ],
      },
      {
        heading: "Who is it for?",
        paragraphs: [
          "Families settling in, retirees, entrepreneurs and remote workers: a villa rented by the year offers a quality of life that is hard to find in an apartment. Some villas in our catalogue are also for sale, if you are thinking of buying later.",
        ],
      },
    ],
    faq: [
      { q: "Which area is best to rent a villa long term?", a: "The Palmeraie for quiet close to the city, the Fez road for large estates, the Ourika and Amizmiz roads for recent villas with Atlas views." },
      { q: "Is pool and garden maintenance included?", a: "It depends on the villa. It may be included in the rent or paid by the tenant: the lease specifies it." },
      { q: "Are villas rented furnished?", a: "Most are, but some can be rented unfurnished. The listing shows it, or we confirm on request." },
      { q: "Do I need a car?", a: "Yes, for most villas on the outskirts. Trips to the centre often take 15 to 30 minutes depending on the area and traffic." },
      { q: "Can I rent a villa and buy it later?", a: "Sometimes, when the owner is open to selling. Some villas in our catalogue are offered both for rent and for sale." },
    ],
    areas: ["Palmeraie", "Route de Fes", "Route de l'Ourika", "Route d'Amizmiz", "Targa"],
  },
};

export default copy;
