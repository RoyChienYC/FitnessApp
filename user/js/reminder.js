
import barchart from './barchart.js'

let unitMap = {
    walk: 'Kilometers',
    run: 'Kilometers',
    swim: 'Laps',
    bike: 'Kilometers',
    yoga: 'Minutes',
    soccer: 'Minutes',
    basketball: 'Minutes',
}

let actionMap = {
    walk: 'Walked',
    run: 'Ran',
    swim: 'Swam',
    bike: 'Biked',
    yoga: 'of Yoga',
    soccer: 'of Soccer',
    basketball: 'of Basketball',
}

let reminderMap = {
    walk: 'Walk',
    run: 'Run',
    swim: 'Swim',
    bike: 'Bike',
    yoga: 'Practice Yoga',
    soccer: 'Play Soccer',
    basketball: 'Play Basketball',
}

let dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

barchart.init('chart-anchor', 500, 300);

let newReminder = await checkForReminders()

/* Set default date in forms to current date */
document.getElementById('viewAct-date').valueAsDate = newUTCDate()


/* Yes Button on Reminder Pop up */
let reminder_option_yes = document.getElementById("reminder-option-yes")
reminder_option_yes.addEventListener("click", () => {
    submitReminder("yes", newReminder)
})


/* No Button on Reminder Pop up */
let reminder_option_no = document.getElementById("reminder-option-no")
reminder_option_no.addEventListener("click", () => {
    submitReminder("no", newReminder)
})


/* 'View Progress' Button next to the 'Past Activity' Section */
let view_progress_button = document.getElementById("view-progress-button")
view_progress_button.addEventListener("click", view_progress_onclick)


/* 'X' Button at the Top Right of the Progress Modal */
let close_modal_icon = document.getElementById("close-modal")
close_modal_icon.addEventListener("click", close_modal)


/* 'Go' Button under the Progress Form of the Progress Modal */
let submit_progress_form_button = document.getElementById("submit-progress-form-button")
submit_progress_form_button.addEventListener("click", submit_progress_form)


/**
 * Pop up the Progress Modal when the User Clicks on 'View Progress'
 */
async function view_progress_onclick() {
    let timeInMS = newUTCDate().getTime() - 1 * 86400000
    let data = await get_activity_data_for_week(
        timeInMS,
        'walk'
    )

    console.log(data)
    document.getElementById('viewAct-date').valueAsDate = new Date(timeInMS)
    document.getElementById('view-activity-dropdown').value = "Walk"
    barchart.render(data, 'Kilometers Walked', 'Day of the Week');
    
    open_modal()
}


/**
 * Handle a 'yes' or 'no' Interaction with Reminder Section
 * @param {string} option - must be 'yes' or 'no'
 */
function submitReminder(option, activityReminder) {
  console.log(activityReminder)

  /* Input Validation */
  if(option != "yes" && option != "no"){
      throw new Error(option + ' is invalid. must be yes or no')
  }
    

  if(option == 'yes') {
    /* Connect to Past Activity Sections */
    let pActAdd = document.getElementById("pAct-Add");
    let pActForm = document.getElementById("pAct-Form");

    /* Show Form, Hide 'Add New Activity' Button */
    pActAdd.classList.add("hide");
    pActForm.classList.remove("hide");

    document.getElementById('pAct-date').valueAsDate = new Date(newReminder.date)
    document.getElementById('pAct-activity').value = activityReminder.activity
    /* Connect to Past Activity Unit Input */
    let pActUnit = document.getElementById("pAct-unit");

    /* Show Form, Hide 'Add New Activity' Button */
    switch (activityReminder.activity) {
      case 'Walk': case 'Run': case 'Bike':
        pActUnit.value = 'km';
        break;
      case 'Swim':
        pActUnit.value = 'laps';
        break;
      case 'Yoga': case 'Soccer': case 'Basketball':
        pActUnit.value = 'minutes';
        break;
      default:
        pActUnit.value = 'units';
    }
  }

  /* Hide Reminder Section */
  let reminder_section = document.getElementById("reminder-section")
  reminder_section.style.display = 'none'
  
  console.log("Reminder: ", option)
}


/**
 * Show the Progress Modal on top of the webpage
 */
function open_modal() {
    let modal = document.getElementById("progress-modal")
    modal.style.display = "flex"
}


/**
 * Hide the Progress Modal from displaying on the webpage
 */
function close_modal() {
    let modal = document.getElementById("progress-modal")
    modal.style.display = "none"
}


/**
 * Update Bar Chart Based off of Progress Form
 */
async function submit_progress_form() {
    /* Activity Week Data Search Parameters */
    let searchParams = {
        activity: document.getElementById('view-activity-dropdown').value.toLowerCase(),
        date: (new Date(
                document.getElementById('viewAct-date')
                    .value
                    .replace('-','/')
            )).getTime()
    }

    /* Determine Y-Axis Label */
    let unit = unitMap[searchParams.activity] || 'none'
    let action = actionMap[searchParams.activity] || 'none'

    /* Fetch Activity Data for Week leading up to selected date */
    let data = await get_activity_data_for_week(searchParams.date, searchParams.activity)
    if (searchParams.date + 0 * 86400000  <= newUTCDate().getTime()) {
        barchart.render(data, `${unit} ${action}`, 'Day of the Week');
    } else {
        alert('Date is too recent')
    }
}


/**
 * Fetch Data from  the week leading up to provided date
 * @param {number} date - ms since 1970
 * @param {string} activity - name of activity to search for
 * @returns {Object} list of data or error message
 */
async function get_activity_data_for_week(date, activity = null) {
    let endpoint = `/week?date=${date}`

    if (activity != null) {
        endpoint += `&activity=${activity}`
    }

    /* Get Activity Reminder from Server */
    let response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    
    return response.json()
}


/**
 * Get Activity Reminder from Server 
 */
 function getReminder() {
     return new Promise((resolve, reject) => {
         fetch(`/reminder`, {
             method: 'GET',
             headers: {
             'Content-Type': 'application/json'
             }
         })
         .then(response => {
           console.log(response);
           return response.json();})
         .then(data => {
             console.log('Reminder Success:', data);
             resolve(data)
         })
         .catch((error) => {
             console.error('Reminder Error:', error);
             resolve(error)
        })
    });
}


/**
 * Capitalizes the first character of a string s
 * @param {string} s - string to capitalize
 * @returns {string} capitalized
 */
function capitalize(s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}


/**
 * Asks server if there are any pendiing activities to complete. if there are
 * then a reminder section will be shown on the webpage to remind the user to
 * complete the activity
 */
async function checkForReminders() {
    let mostRecent = await getReminder()

    if (mostRecent.message) {
        return 
    }
    
    /* Determine date relative to current date */
    let day = 'yesterday'
    if (mostRecent.date != newUTCDate().getTime() - 86400000) {
        day ='on ' + dayOfWeek[(new Date(mostRecent.date)).getDay()]
    }

    /* Update text prompt of reminder section */
    let reminderSection = document.getElementById('reminder-section')
    let reminderQuestion = document.getElementById('reminder-question')
    let mostRecentActivity = capitalize(reminderMap[mostRecent.activity.toLowerCase()])
    reminderSection.style.display = 'flex'
    reminderQuestion.textContent = `Did you ${mostRecentActivity} ${day}?`

    return {
      activity: capitalize(mostRecent.activity),
      date: mostRecent.date
    }
}
