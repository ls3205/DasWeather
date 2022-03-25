import { client, apiKey } from './index'
import DiscordJS from "discord.js";
import urllib from 'urllib';

function kelToFahr(kel) {
    return Math.round(((kel - 273.15) * (9 / 5) + 32) * 100) / 100;
};

function getJson(url) {
    return new Promise((resolve, reject) => {
        urllib.request(url, function (err, data, res) {
            if (err) {
                console.log(err);
            }
        });
    });
}

export async function now(message, zipcode) {
    console.log(`Using NOW function (zipcode: ${zipcode}). (${message.author.username})`);

    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${apiKey}`;
    console.log(url);
    const response = await getJson(url).then(data => {
        // @ts-ignore
        return JSON.parse(data.toString());
    });
    console.log(`RESPONSE: ${response}`)

    if (response.cod === "404") return;

    const temperature = kelToFahr(response.main.temp);
    const feelsLike = kelToFahr(response.main.feels_like);
    const kelvin = response.main.temp;

    const weather = response.weather[0].main;
    const description = response.weather[0].description;

    const city = response.name;
    const lat = response.coord.lat;
    const lon = response.coord.lon;

    const embed = new DiscordJS.MessageEmbed()
        .setColor('#03adfc')
        .setTitle(`Current Weather`)
        .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
        .addFields(
            { name: 'Temperature', value: `${temperature}°F (${kelvin}°K)`, inline: true },
            { name: 'Feels Like', value: `${feelsLike}°F`, inline: true },
            { name: 'Weather', value: `${weather} (${description})`, inline: true },
        )
        .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + response.weather[0].icon + '@2x.png' })

    message.channel.send({ embeds: [embed] });
};

// export async function hourly(message, zipcode) {
//     console.log(`Using HOURLY function (zipcode: ${zipcode}). (${message.author.username})`);

//     const urlInitial = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${apiKey}`
//     console.log(urlInitial);
//     const responseInitial = await getJson(urlInitial).then(data => responseInitial);
//     console.log(responseInitial);

//     if (responseInitial.cod === "404") return;

//     const lat = responseInitial.coord.lat;
//     const lon = responseInitial.coord.lon;
//     console.log(lat, lon);

//     const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&appid=${apiKey}`
//     console.log(url);
//     const response = await getJson(url).then(data => response);

//     console.log(response);
// };