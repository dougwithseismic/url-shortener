import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import 'babel-polyfill'
import chalk from 'chalk'
import { eventBus } from './eventBus'

import bodyParser from 'body-parser'

import { scriptLibrary, ScriptManager } from './scriptManager/'
import { UserManager } from './userManager'
import { AccessManager } from './accessManager'
import { CommsManager } from './commsManager'

// Loads event listeners. Probably not the best place for it.
UserManager.init()
CommsManager.init()
AccessManager.init()

/*

User buys - Admin creates. User signs up.
---> userManager.createUser({...user, source: { type: 'web', }}) 
  ==> accessManager.generateKey()

User has purchased, User requests trial.
---> accessManager.grantAccess(apiKey, script, timeLength)
  ==> 

Script cancelled, Trial ends
---> accessManager.checkAccess / removeAccess
  ==> 

Script Runs
---> accessManager.hasAccess && scriptManager.serveContent


*/

// UserManager.generateNewTokenForUser("iQWUZPXxtOp8Gh3VhVUW")

// UserManager.createUser({ name: 'doug', email: 'doug@withseismic.com', password: '123' })
// UserManager.deleteUser().then((response) => console.log('resp : ', response))
// import "./app"

// UserManager.nukeUsers()
//   AccessManager.nukeAccess()
// AccessManager.grantAccess('DJDXQ4KFQ9MA95KC89KTVW22289S', 2, 30)

// AccessManager.createAccessPoint('R7VRPWT8T94K8TQE9DJ3AKRCQBWE')
//AccessManager.giveAccessToScript('R7VRPWT8T94K8TQE9DJ3AKRCQBWE', 2)

let port = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Serve Script + AUTH
app.get('/scripts/:apiKey/:scriptId', async (req, res) => {
  console.log(req.get('user-agent'))
  // 1. Check that API key is valid
  // 2. Check key has access to that script (and that request is coming from Google user-agent)
  // 3. Serve script

  const { apiKey } = req.params
  // !! Params are strings by default. fml
  const scriptId = parseInt(req.params.scriptId)
  const hasAccess = await AccessManager.checkAccess(apiKey, scriptId)

  if (!hasAccess) {
    res.send({
      status: false,
      response:
        'This API Key doesnt have access to this script - Double check and try again. Still an issue? Contact support@scriptomatics.com with this Error'
    })
    return
  } else if (!req.get('user-agent').includes('Google-Apps-Script')) {
    res.send({
      status: false,
      response: 'Invalid Request - Contact support@scriptomatics.com'
    })
    return
  }

  const scriptContent = scriptLibrary.find((script) => {
    return script.id == scriptId
  })

  if (scriptContent == undefined) {
    res.status(403).send({
      status: false,
      response: `Script Not found`
    })
    return
  }

  console.log('Script Delivered:', scriptId, apiKey)
  res.send({
    status: true,
    response: `Script Loaded - ${scriptContent.name} v${scriptContent.version} by Scriptomatics.com - Go get 'em! Need a hand? support@scriptomatics.com`,
    scriptContent: scriptContent.getScriptContent()
  })
})

app.post('/admin/createCustomer', async (req, res) => {
  const shopifyTopic = req.header('X-Shopify-Topic')
  if (shopifyTopic !== 'customers/create') {
    console.log('False Header: Ignoring Req.')
    return
  }

  /*

{
    id: 706405506930370084,
    email: 'bob@biller.com',
    accepts_marketing: true,
    created_at: null,
    updated_at: null,
    first_name: 'Bob',
    last_name: 'Biller',
    orders_count: 0,
    state: 'disabled',
    total_spent: '0.00',
    last_order_id: null,
    note: 'This customer loves ice cream',
    verified_email: true,
    multipass_identifier: null,
    tax_exempt: false,
    phone: null,
    tags: '',
    last_order_name: null,
    currency: 'USD',
    addresses: [],
    accepts_marketing_updated_at: null,
    marketing_opt_in_level: null,
    admin_graphql_api_id: 'gid://shopify/Customer/706405506930370084'
  }

*/

  eventBus.emit('createCustomer', req.body)
  res.send({ message: 'thanks' })
})

app.post('/admin/orderPayment', async (req, res) => {
  const dummy = {
    id: 444444444444444,
    email: 'jon@doe.ca',
    closed_at: null,
    created_at: '2020-04-06T10:29:55-04:00',
    updated_at: '2020-04-06T10:29:55-04:00',
    number: 234,
    note: null,
    token: '123456abcd',
    gateway: null,
    test: true,
    total_price: '403.00',
    subtotal_price: '393.00',
    total_weight: 0,
    total_tax: '0.00',
    taxes_included: false,
    currency: 'USD',
    financial_status: 'voided',
    confirmed: false,
    total_discounts: '5.00',
    total_line_items_price: '398.00',
    cart_token: null,
    buyer_accepts_marketing: true,
    name: '#9999',
    referring_site: null,
    landing_site: null,
    cancelled_at: '2020-04-06T10:29:55-04:00',
    cancel_reason: 'customer',
    total_price_usd: null,
    checkout_token: null,
    reference: null,
    user_id: null,
    location_id: null,
    source_identifier: null,
    source_url: null,
    processed_at: null,
    device_id: null,
    phone: null,
    customer_locale: 'en',
    app_id: null,
    browser_ip: null,
    landing_site_ref: null,
    order_number: 1234,
    discount_applications: [
      {
        type: 'manual',
        value: '5.0',
        value_type: 'fixed_amount',
        allocation_method: 'one',
        target_selection: 'explicit',
        target_type: 'line_item',
        description: 'Discount',
        title: 'Discount'
      }
    ],
    discount_codes: [],
    note_attributes: [],
    payment_gateway_names: [ 'visa', 'bogus' ],
    processing_method: '',
    checkout_id: null,
    source_name: 'web',
    fulfillment_status: 'pending',
    tax_lines: [],
    tags: '',
    contact_email: 'jon@doe.ca',
    order_status_url: 'https://apple.myshopify.com/690933842/orders/123456abcd/authenticate?key=abcdefg',
    presentment_currency: 'USD',
    total_line_items_price_set: {
      shop_money: {
        amount: '398.00',
        currency_code: 'USD'
      },
      presentment_money: {
        amount: '398.00',
        currency_code: 'USD'
      }
    },
    total_discounts_set: {
      shop_money: {
        amount: '5.00',
        currency_code: 'USD'
      },
      presentment_money: {
        amount: '5.00',
        currency_code: 'USD'
      }
    },
    total_shipping_price_set: {
      shop_money: {
        amount: '10.00',
        currency_code: 'USD'
      },
      presentment_money: {
        amount: '10.00',
        currency_code: 'USD'
      }
    },
    subtotal_price_set: {
      shop_money: {
        amount: '393.00',
        currency_code: 'USD'
      },
      presentment_money: {
        amount: '393.00',
        currency_code: 'USD'
      }
    },
    total_price_set: {
      shop_money: {
        amount: '403.00',
        currency_code: 'USD'
      },
      presentment_money: {
        amount: '403.00',
        currency_code: 'USD'
      }
    },
    total_tax_set: {
      shop_money: {
        amount: '0.00',
        currency_code: 'USD'
      },
      presentment_money: {
        amount: '0.00',
        currency_code: 'USD'
      }
    },
    total_tip_received: '0.0',
    original_total_duties_set: null,
    current_total_duties_set: null,
    admin_graphql_api_id: 'gid://shopify/Order/820982911946154508',
    shipping_lines: [
      {
        id: 271878346596884015,
        title: 'Generic Shipping',
        price: '10.00',
        code: null,
        source: 'shopify',
        phone: null,
        requested_fulfillment_service_id: null,
        delivery_category: null,
        carrier_identifier: null,
        discounted_price: '10.00',
        price_set: {
          shop_money: {
            amount: '10.00',
            currency_code: 'USD'
          },
          presentment_money: {
            amount: '10.00',
            currency_code: 'USD'
          }
        },
        discounted_price_set: {
          shop_money: {
            amount: '10.00',
            currency_code: 'USD'
          },
          presentment_money: {
            amount: '10.00',
            currency_code: 'USD'
          }
        },
        discount_allocations: [],
        tax_lines: []
      }
    ],
    billing_address: {
      first_name: 'Bob',
      address1: '123 Billing Street',
      phone: '555-555-BILL',
      city: 'Billtown',
      zip: 'K2P0B0',
      province: 'Kentucky',
      country: 'United States',
      last_name: 'Biller',
      address2: null,
      company: 'My Company',
      latitude: null,
      longitude: null,
      name: 'Bob Biller',
      country_code: 'US',
      province_code: 'KY'
    },
    shipping_address: {
      first_name: 'Steve',
      address1: '123 Shipping Street',
      phone: '555-555-SHIP',
      city: 'Shippington',
      zip: '40003',
      province: 'Kentucky',
      country: 'United States',
      last_name: 'Shipper',
      address2: null,
      company: 'Shipping Company',
      latitude: null,
      longitude: null,
      name: 'Steve Shipper',
      country_code: 'US',
      province_code: 'KY'
    },
    customer: {
      id: 3015896727686,
      email: 'doug@withseismic.com',
      accepts_marketing: false,
      created_at: null,
      updated_at: null,
      first_name: 'John',
      last_name: 'Smith',
      orders_count: 0,
      state: 'disabled',
      total_spent: '0.00',
      last_order_id: null,
      note: null,
      verified_email: true,
      multipass_identifier: null,
      tax_exempt: false,
      phone: null,
      tags: '',
      last_order_name: null,
      currency: 'USD',
      accepts_marketing_updated_at: null,
      marketing_opt_in_level: null,
      admin_graphql_api_id: 'gid://shopify/Customer/115310627314723954',
      default_address: {
        id: 715243470612851245,
        customer_id: 115310627314723954,
        first_name: null,
        last_name: null,
        company: null,
        address1: '123 Elm St.',
        address2: null,
        city: 'Ottawa',
        province: 'Ontario',
        country: 'Canada',
        zip: 'K2H7A8',
        phone: '123-123-1234',
        name: '',
        province_code: 'ON',
        country_code: 'CA',
        country_name: 'Canada',
        default: true
      }
    },
    line_items: [
      {
        id: 866550311766439020,
        variant_id: 808950810,
        title: 'IPod Nano - 8GB',
        quantity: 1,
        sku: 'IPOD2008PINK',
        variant_title: null,
        vendor: null,
        fulfillment_service: 'manual',
        product_id: 632910392,
        requires_shipping: true,
        taxable: true,
        gift_card: false,
        name: 'IPod Nano - 8GB',
        variant_inventory_management: 'shopify',
        properties: [],
        product_exists: true,
        fulfillable_quantity: 1,
        grams: 567,
        price: '199.00',
        total_discount: '0.00',
        fulfillment_status: null,
        price_set: {
          shop_money: {
            amount: '199.00',
            currency_code: 'USD'
          },
          presentment_money: {
            amount: '199.00',
            currency_code: 'USD'
          }
        },
        total_discount_set: {
          shop_money: {
            amount: '0.00',
            currency_code: 'USD'
          },
          presentment_money: {
            amount: '0.00',
            currency_code: 'USD'
          }
        },
        discount_allocations: [],
        duties: [],
        admin_graphql_api_id: 'gid://shopify/LineItem/866550311766439020',
        tax_lines: []
      }
    ],
    fulfillments: [],
    refunds: []
  }

  // const shopifyTopic = req.header('X-Shopify-Topic')
  // if (shopifyTopic !== 'orders/paid') {
  //   console.log('False Header: Ignoring Req.')
  //   res.send({ status: false, response: 'false Header' })
  //   return
  // }

  const orderDetails = Object.keys(req.body).length === 0 ? dummy : req.body
  const skus = orderDetails.line_items.map((product) => product.sku)

  AccessManager.grantAccessOnOrder({ customer: orderDetails.customer, skus }).then(() => {
    res.sendStatus(200)
  })
})

// Delivers content
app.get('/downloads/scripts/:customerId/:apiKey/:scriptId', async (req, res) => {
  const { customerId, apiKey, scriptId } = req.params
  console.log('apiKey :>> ', apiKey)

  // Check if API is legit
  const token = await UserManager.getTokenFromApiKey(apiKey)
  console.log('token :>> ', token)

  if (!token) {
    console.log('Download Attempt Failed: No Token Found on', apiKey)
    res.status(403).send('Access Denied - Wrong API Key. Visit Scriptomatics.com')
    return
  }

  // Get Customer Details (for loader customization)
  const userDetails = await UserManager.findUser('cid', parseInt(customerId))
  console.log('userDetails :>> ', userDetails)

  if (!userDetails) {
    console.log('Couldnt find user in DB -  Skipping Download')
    res.status(403).send('Access Denied - support@Scriptomatics.com')
    return
  }

  // Get Script Details
  const scriptDetails = ScriptManager.getScriptDetailsFromId(scriptId)
  console.log('scriptDetails :>> ', scriptDetails)

  if (scriptDetails == undefined) {
    console.log('Couldnt find script from scriptId')
    res.status(403).send('Access Denied - Wrong Script Id. support@Scriptomatics.com')
  }

  res.set({ 'Content-Disposition': `attachment; filename="Scriptomatics - ${scriptDetails.name}.txt"` })
  res.send(ScriptManager.generateLoader(apiKey, scriptDetails))
})

app.listen(port, () => {
  console.log(chalk.bgBlackBright('Scriptomatics :: Server Live on port', port))
})
