import { client, apiKey } from './index'
import DiscordJS from "discord.js";
import urllib from 'urllib';

function kelToFahr(kel) {
    return Math.round(((kel - 273.15) * (9 / 5) + 32) * 100) / 100;
};

export async function now(message, zipcode) {
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${apiKey}`;
    urllib.request(url, function (err, data, res) {
        if (err) {
            console.log(err);
        };
        const response = JSON.parse(String(data));

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
            .addField('Temperature', `${temperature}°F (${kelvin}°K)`, true)
            .addField('Feels Like', `${feelsLike}°F`, true)
            .addField('Weather', `${weather} (${description})`, true)
            .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + response.weather[0].icon + '@2x.png' })

        message.channel.send({ embeds: [embed] });
    });
};