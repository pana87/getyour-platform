const https = require('https')

export const handler = async (event, context) => {

  if (event.body === undefined) {
    return {
      statusCode: 404,
      body: "Not Found"
    }
  }

  const data = await _getAccountInformationFromHederaRestApi(JSON.parse(event.body).accountId)

  return {
    statusCode: 200,
    body: data
  }
}

function _getAccountInformationFromHederaRestApi(accountId) {
  return new Promise((resolve, reject) => {
    https.get(`https://mainnet-public.mirrornode.hedera.com/api/v1/accounts?account.id=${accountId}`, (res) => {
      let data = ''
      res.on('data', buffer => data += buffer)
      res.on('end', () => resolve(data))
    }).on('error', (error) => reject(error))
  })
}
