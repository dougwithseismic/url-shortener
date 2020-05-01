const options = {
  id: 3,
  name: 'CTR Magnet - Include Todays date in adcopy!',
  version: '1.0.1',
  platform: 'Google Ads',
  type: 'Script',
  setupInstructions: `/* 

    Dynamically Insert Today's Date, Day, Month, Year etc into adcopy!  Great for CTR boosts.
    
    
    Setup: 
   
    1. Set script to run Daily at 00:00
    2. Run script once to create data feed (Check Business Data > Data Feeds > Date) AND CHECK THE SCRIPT LOGS TO MAKE SURE YOUR ACCOUNT IS RUNNING IN THE RIGHT TIMEZONE.
    3. Use {=Date. ...} in your adcopy to dynamically include dates.
    4. Report back on your CTR increases!

    FAQ - 
    
    Q.'According to the Log, My timezone wrong... How do I fix this?'
    A. By default, scripts run at America/Los_Angeles (Pacific time) - to make scripts run at your accounts local timezone, 
    this script grabs the timezone of the account running the script. If this account setting has been set up incorrectly, the timing used might be off by as much as 12 hours!

    To fix, change the line below, where x is the correct timezone, as found in this link https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    var realTimezone = 'x'

    (https://developers.google.com/google-ads/scripts/docs/features/dates)

    Q. 'Can I change the text of days / month?' 
    A. Sure you can - Just edit the text in the days and months array below.

    Q. Does this work with bing?
    A. Yep ;)
    
    */
   
   `
}

const getScriptContent = () => {
  return `
  var realTimezone 
  // realTimezone = 'Europe/Prague' // Uncomment this line (remove the //) if you need to edit your timezone.

  var days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]
  var months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ]
  
        var checkTime
        var timeZoneString 

    function runScript() {

if (Utilities.formatDate == 'undefined') {
  // Bing still doesnt have a formatDate utility equivalent so lets load momentJs to fix it.
  Logger.log('Bing Script Mode Loaded')
  eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment.min.js').getContentText())
  eval(
    UrlFetchApp.fetch(
      'https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.23/moment-timezone-with-data-2012-2022.min.js'
    ).getContentText()
  )

  checkTime = moment(new Date()).tz(AdsApp.currentAccount().getTimeZone()).format('MMMM dd, yyyy HH:mm:ss Z')

  if (typeof realTimezone !== 'undefined') {
    checkTime = moment(new Date()).tz(realTimezone).format('MMMM dd, yyyy HH:mm:ss Z')
    timeZoneString = realTimezone
  }

} else {
  checkTime = Utilities.formatDate(new Date(), AdsApp.currentAccount().getTimeZone(), 'MMMM dd, yyyy HH:mm:ss Z')
  timeZoneString = AdsApp.currentAccount().getTimeZone()

  if (typeof realTimezone !== 'undefined') {
    checkTime = Utilities.formatDate(new Date(), realTimezone, 'MMMM dd, yyyy HH:mm:ss Z')
    timeZoneString = realTimezone
  }
}
        


    


    
    
      Logger.log('Running CTR Magnet - Date Customizer')
      Logger.log('---')
      Logger.log('Time: %s (%s)',  timeZoneString, checkTime)
      Logger.log('Is this the correct time? If not, refer to the setup guide for a quick fix!')
      Logger.log('---')
    
      
      var dataFeed = grabDataSource('Date')
      var dateOptions = calcDate(0)
      
   
      
      if (dataFeed.items().get().totalNumEntities() === 0) {  
        
        Logger.log('Creating a new item in empty data feed')
        dataFeed.adCustomizerItemBuilder().withAttributeValues(dateOptions).build()   
      } else {
        
        var currentDataFeed = dataFeed.items().get().next()
        Logger.log('Updating Feed values from current date')  
        currentDataFeed.setAttributeValues(dateOptions)
        
      }
      
      
      Logger.log('Script Finished, Dates Updated')
      
    }
    
    
    function calcDate() {
     
      var now = new Date()
      
      // We need to correct our time.. 
         
      var today = new Date(Utilities.formatDate(now, AdsApp.currentAccount().getTimeZone(), "MMMM dd, yyyy HH:mm:ss Z"))
      
      if (typeof realTimezone !== 'undefined') {     
        today = new Date(Utilities.formatDate(new Date(), realTimezone, "MMMM dd, yyyy HH:mm:ss Z"))
      }  
        
      
      return {
        today: today.toLocaleDateString(), // Wednesday 22nd April 2020
        day: days[today.getDay()], 
        ordinal: getOrdinal(today.getDate()), // 1st, 2nd, 3rd.. 
        month: months[today.getMonth()],
        date: today.getDate().toString(), 
        year: today.getFullYear().toString()
      } 
      
    }
    
    function getOrdinal(date) {
     
    if (date > 3 && date < 21) return date + 'th'
      
      switch (date % 10)  
      {
        case 1:
          return date + 'st'
          
        case 2:
          return date + 'nd'
          
        case 3:
          return date + 'rd'
          
          
        default:
          return date + 'th'
            
      } 
      
    }
    
    
    function grabDataSource(name) {
     
       var sources = AdsApp.adCustomizerSources().get()
       
       while (sources.hasNext()) {
         var source = sources.next()
         if (source.getName() === name) {
          
           Logger.log('Found Data Feed Source: %s', source.getName())
           return source
        
         }
            
       }
      
      Logger.log('No source found: creating new source %s', name)
      return AdsApp.newAdCustomizerSourceBuilder()
      .withName(name)
      .addAttributes({
        today: 'text',
        day: 'text',
        ordinal: 'text',
        month: 'text',
        date: 'text',
        year: 'text'
      })
      .build()
      .getResult()
      
    
    }
    
    
    runScript()
      `
}

module.exports = {
  ...options,
  getScriptContent
}
