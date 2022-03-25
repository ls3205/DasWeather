import { client, apiKey } from './index'
import DiscordJS from "discord.js";
import urllib from 'urllib';

function kelToFahr(kel) {
    return Math.round(((kel - 273.15) * (9 / 5) + 32) * 100) / 100;
};

export async function now(message, zipcode) {
    console.log(`Using NOW function (zipcode: ${zipcode}). (${message.author.username})`);
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${apiKey}`;
    urllib.request(url, (err, data, res) => {
        if (err) {
            console.log(err);
        }
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
            .addFields(
                { name: 'Temperature', value: `${temperature}°F (${kelvin}°K)`, inline: true },
                { name: 'Feels Like', value: `${feelsLike}°F`, inline: true },
                { name: 'Weather', value: `${weather} (${description})`, inline: true },
            )
            .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + response.weather[0].icon + '@2x.png' })

        message.channel.send({ embeds: [embed] });
    });

};

export async function hourly(message, zipcode) {
    console.log(`Using HOURLY function (zipcode: ${zipcode}). (${message.author.username})`);

    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&appid=${apiKey}`;
    var city;

    urllib.request(url).then(data => {
        const response = data.data;
        const responseJSON = JSON.parse(response.toString());
        return responseJSON;
    }).catch(err => {
        console.log(err);
    }).then(responseJSON => {
        const lat = responseJSON.coord.lat;
        const lon = responseJSON.coord.lon;
        city = responseJSON.name;
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&appid=${apiKey}`;
        urllib.request(url).then(data => {
            const response = data.data;
            const responseJSON = JSON.parse(response.toString());
            return responseJSON;
        }).catch(err => {
            console.log(err);
        }).then(responseJSON => {
            const offset = responseJSON.timezone_offset;

            const current = responseJSON.current;
            const currentTemp = kelToFahr(current.temp);
            const currentFeelsLike = kelToFahr(current.feels_like);
            const currentWeather = current.weather[0].main;
            const currentDescription = current.weather[0].description;

            const embed = new DiscordJS.MessageEmbed()
                .setColor('#03adfc')
                .setTitle(`Hourly Weather`)
                .setDescription(`Weather in [${city}](https://www.google.com/maps/place/${lat},${lon}):`)
                .addFields(
                    { name: 'Time', value: 'Now', inline: true },
                    { name: 'Temperature', value: `${currentTemp}°F (Feels like: ${currentFeelsLike}°F)`, inline: true },
                    { name: 'Weather', value: `${currentWeather} (${currentDescription})`, inline: true },
                )
                .setAuthor({ name: `OpenWeatherMap`, iconURL: 'https://openweathermap.org/img/wn/' + current.weather[0].icon + '@2x.png' })
            
            message.channel.send({ embeds: [embed] });
        });
    });
};