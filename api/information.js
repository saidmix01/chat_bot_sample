const axios = require('axios');

//const url_api = "http://142.44.227.108/admin_chatbot/api/";
const url_api = "http://localhost/admin_chatbot/api/";

/**
 * Realiza una solicitud POST a la API.
 * @param {string} url - La URL de la API.
 * @param {object} data - Los datos que se enviarán en el cuerpo de la solicitud (en formato JSON).
 * @returns {Promise<object>} - Una promesa que se resolverá con la respuesta de la API.
 */
async function get_store_information(data) {
    try {
        const response = await axios.post(`${url_api}get_store_information`, data);
        return response.data;
    } catch (error) {
        throw new Error(`Error al hacer la solicitud: ${error.message}`);
    }
}

async function get_questions(data) {
    try {
        const response = await axios.post(`${url_api}get_questions`, data);
        return response.data;
    } catch (error) {
        throw new Error(`Error al hacer la solicitud: ${error.message}`);
    }
}

async function get_options_by_list(data) {
    try {
        const response = await axios.post(`${url_api}get_options_by_list`, data);
        return response.data;
    } catch (error) {
        throw new Error(`Error al hacer la solicitud: ${error.message}`);
    }
}

async function save_statistics(data) {
    try {
        const response = await axios.post(`${url_api}save_statistics`, data);
        return response.data;
    } catch (error) {
        throw new Error(`Error al hacer la solicitud: ${error.message}`);
    }
}

async function update_statistics(data) {
    try {
        const response = await axios.post(`${url_api}update_statistics`, data);
        return response.data;
    } catch (error) {
        throw new Error(`Error al hacer la solicitud: ${error.message}`);
    }
}

module.exports = {
    get_store_information,
    get_questions,
    get_options_by_list,
    save_statistics,
    update_statistics
}