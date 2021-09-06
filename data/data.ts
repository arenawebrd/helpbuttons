const data = [
    {
        name: "Perritos en adopcion",
        location: "Livorno, Italia",
        tags: ["Animales", "Perritos", "Adopcion"],
        url: "net/url",
        avatar: "image/url.png",
        description: "Net for animal rescue",
        private_net: "private",
        button_name: "pedidos",
        button_type: {}, //array of types, each type has an int, a name and a color associated. Default are offer (green), need (red). 
        roles:[(2,"admin",[111,131,232])], //array of roles specific for the net, default are net admins. Each of these net roles have their user list
        blocked_users: [11,223,133],
        latitude: 43.33,
        longitude: 43.33,
        radius: 240,
        friend_nets:[12,234],
        net_modules:[0,10,23],
        template:{},

        buttons: [
            {
                type: 1,
                tags: ["tag1", "tag2", "tag3"],
                date: ["1/08/2021"],
                location: ["Livorno, Italia"],
                longitude: [43.2333],
                latitude: [21.0002],
                networks: [13,24],
                is_group: true,
                template: {}, //JSON template contains info about the image and the description (standard) and also about booleans, checklist and every other field related to the network module
            },
            {
                type: 1,
                tags: ["tag1", "tag2", "tag3"],
                date: ["1/08/2021"],
                location: ["Livorno, Italia"],
                longitude: [43.2333],
                latitude: [21.0002],
                networks: [13,24],
                is_group: true,
                template: {}, //JSON template contains info about the image and the description (standard) and also about booleans, checklist and every other field related to the network module
            },
        ]
    },
    {
        name: "Alimentos en Asturias",
        location: "Livorno, Italia",
        tags: ["Animales", "Perritos", "Adopcion"],
        url: "net/url",
        avatar: "image/url.png",
        description: "Net for animal rescue",
        private_net: "private",
        button_name: "pedidos",
        button_type: {},
        roles:["rol1","rol2"],
        blocked_users:,
        latitude: 43.33,
        longitude: 43.33,
        radius: 240,
        friend_nets:[12,234],
        net_modules:[0,10,23],
        template:{},
        buttons: [
            {
                type: 1,
                tags: ["tag1", "tag2", "tag3"],
                date: ["1/08/2021"],
                location: ["Livorno, Italia"],
                longitude: [43.2333],
                latitude: [21.0002],
                networks: [13,24],
                is_group: true,
                template: {}, //JSON template contains info about the image and the description (standard) and also about booleans, checklist and every other field related to the network module
            },
            {
                type: 1,
                tags: ["tag1", "tag2", "tag3"],
                date: ["1/08/2021"],
                location: ["Livorno, Italia"],
                longitude: [43.2333],
                latitude: [21.0002],
                networks: [13,24],
                is_group: true,
                template: {}, //JSON template contains info about the image and the description (standard) and also about booleans, checklist and every other field related to the network module
            },
        ]
    },
];

export default fakeData;
