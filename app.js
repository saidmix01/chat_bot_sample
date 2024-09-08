const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const emoji = require('node-emoji');

//My imports
const { get_store_information, get_questions, get_options_by_list, save_statistics, update_statistics } = require('./api/information')

const msg_error = "🚫 ¡Ups! Parece que algo salió mal. Estamos trabajando para solucionarlo. Por favor, inténtalo de nuevo más tarde. 😅";

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAction(async (ctx, { flowDynamic, endFlow, state }) => {
        try {
            const response_save_statistics = await save_statistics({
                st_information:ctx,
                st_status:1,
                st_create_date: new Date()
            });
            if(! response_save_statistics.status) throw new Error(response_save_statistics.message);
            await state.update({st_id:response_save_statistics.data})
            const response_store = await get_store_information({ sto_id: 1, us_id: 1 });
            const response_questions = await get_questions({ "cq.us_id": 1, "cq.chq_parent": 0 });
            if (!response_questions.status) throw new Error(response_questions.message);

            await flowDynamic(emoji.emojify(response_store.data[0].sto_wellcome_message))

            const valid_opt_main = [];
            for (const opt_main of response_questions.data) {
                await flowDynamic(emoji.emojify(opt_main.chq_text));
                valid_opt_main.push(opt_main.chq_order);
            }
            //save stage
            await state.update({ valid_opt_main });
            return await flowDynamic(`Selecciona la opción que deseas… 😊👇`);
        } catch (error) {
            console.log(error);
            const get_stage = await state.getMyState();
            await update_statistics({
                st_status:4,
                st_log:error,
                st_id: get_stage.st_id
            })
            return endFlow(emoji.emojify(msg_error));
        }
    })
    .addAction({ capture: true }, async (ctx, { flowDynamic, state, endFlow, fallback }) => {
        try {
            const get_stage = await state.getMyState();
            if (!get_stage.valid_opt_main.includes(ctx.body)) {
                return fallback();
            }
            await state.update({ main_opt: ctx.body });
            const response_opt = await get_options_by_list({ "o.lis_id": ctx.body, "o.us_id": 1 });
            //Validate response
            if (!response_opt.status) {
                throw new Error(response_opt.message);
            }
            //Declare array valid options
            const valid_opt_products = [];
            // show products user
            for (const element of response_opt.data) {
                await flowDynamic(emoji.emojify(`${element.opt_description}. *$${element.opt_price}*`));
                valid_opt_products.push(element.opt_order);
            }
            //save stage
            await state.update({ valid_opt_products });
            const update_response = await update_statistics({
                st_status:2,
                st_id: get_stage.st_id
            });
            if(! update_response.status) throw new Error(update_response.message);
            return await flowDynamic(`Selecciona la opción que deseas… 😊👇`);
        } catch (error) {
            console.log(error);
            const get_stage = await state.getMyState();
            await update_statistics({
                st_status:4,
                st_log:error,
                st_id: get_stage.st_id
            })
            return endFlow(emoji.emojify(msg_error));
        }
    })
    .addAction({ capture: true }, async (ctx, { flowDynamic, state, fallBack }) => {
        try {
            const get_stage = await state.getMyState();
            if (get_stage.valid_opt_products.includes(ctx.body)) {
                await state.update({ product_opt: ctx.body });
                const response_questions = await get_questions({ "cq.us_id": 1, "cq.chq_parent": get_stage.main_opt });
                if (!response_questions.status) throw new Error(response_questions.message);
                const valid_opt_send = [];
                for (const opt of response_questions.data) {
                    await flowDynamic(emoji.emojify(opt.chq_text));
                    valid_opt_send.push(opt.chq_order);
                }
                await state.update({ valid_opt_send });
                const response_opt = await get_options_by_list({ "o.lis_id": 2, "o.us_id": 1 });
                const valid_yes_no_opt = [];
                for (const element of response_opt.data) {
                    await flowDynamic(emoji.emojify(`${element.opt_description}`));
                    let resp = "";
                    if(element.opt_order == 1){
                        resp = "si"
                    }else{
                        resp = "no";
                    }
                    valid_yes_no_opt.push(resp);
                }
                const update_response = await update_statistics({
                    st_status:2,
                    st_id: get_stage.st_id
                });
                if(! update_response.status) throw new Error(update_response.message);
                await state.update({ valid_yes_no_opt });
            } else {
                return fallBack();
            }
        } catch (error) {
            console.log(error);
            const get_stage = await state.getMyState();
            await update_statistics({
                st_status:4,
                st_log:error,
                st_id: get_stage.st_id
            })
            return endFlow(emoji.emojify(msg_error));
        }
    })
    .addAction({ capture: true }, async (ctx, { flowDynamic, state, endFlow, fallback }) => {
        try {
            const get_stage = await state.getMyState();
            if (get_stage.valid_yes_no_opt.includes(ctx.body)) {
                let opt = ctx.body == 'si' ? 1 : 2;
                const response_questions = await get_questions({ "cq.us_id": 1, "cq.chq_parent": 6, "cq.chq_order":opt });
                if (!response_questions.status) throw new Error(response_questions.message);
                const valid_address_send = [];
                
                for (const opt of response_questions.data) {
                    await flowDynamic(emoji.emojify(opt.chq_text));
                    valid_address_send.push(opt.chq_order);
                }
                await state.update({ valid_opt_send: valid_address_send });
            }
            const update_response = await update_statistics({
                st_status:3,
                st_id: get_stage.st_id
            });
            if(! update_response.status) throw new Error(update_response.message);
            return endFlow(emoji.emojify(`¡Gracias por elegir nuestros productos/servicios! Valoramos tu confianza y estamos emocionados de tenerte como parte de nuestra comunidad. Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos. ¡Que disfrutes de tu nueva adquisición! 🎉`));
        } catch (error) {
            console.log(error);
            const get_stage = await state.getMyState();
            await update_statistics({
                st_status:4,
                st_log:error,
                st_id: get_stage.st_id
            })
            return endFlow(emoji.emojify(msg_error));
        }
    })

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
