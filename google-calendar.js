/**
 * Google Calendar API Module for TaskFlow
 * Supports real Google OAuth 2.0 API & Demo Mode for instant testing.
 */

(function() {
  let CLIENT_ID = localStorage.getItem('taskflow-gcal-clientid') || '';
  let API_KEY = localStorage.getItem('taskflow-gcal-apikey') || '';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

  let tokenClient = null;
  let gapiInited = false;
  let gisInited = false;
  let onAuthChangeCallback = null;
  let userEmail = localStorage.getItem('taskflow-gcal-email') || null;
  let isDemoMode = localStorage.getItem('taskflow-gcal-demo') === 'true';

  const GoogleCalendarAPI = {
    ready: false,

    init: function(onAuthChange) {
      console.log('GoogleCalendarAPI initializing...');
      onAuthChangeCallback = onAuthChange;

      if (isDemoMode && userEmail) {
        this.ready = true;
        if (onAuthChangeCallback) onAuthChangeCallback(true);
        return;
      }

      if (CLIENT_ID && API_KEY && CLIENT_ID !== 'YOUR_CLIENT_ID' && API_KEY !== 'YOUR_API_KEY') {
        this._checkReady();
      } else {
        // Ready in fallback state
        this.ready = true;
        if (userEmail && onAuthChangeCallback) onAuthChangeCallback(true);
      }
    },

    setCredentials: function(clientId, apiKey) {
      CLIENT_ID = clientId;
      API_KEY = apiKey;
      localStorage.setItem('taskflow-gcal-clientid', clientId);
      localStorage.setItem('taskflow-gcal-apikey', apiKey);
      isDemoMode = false;
      localStorage.setItem('taskflow-gcal-demo', 'false');
      this.gapiLoaded();
      this.gisLoaded();
    },

    enableDemoMode: function() {
      isDemoMode = true;
      userEmail = 'demo.user@gmail.com';
      localStorage.setItem('taskflow-gcal-demo', 'true');
      localStorage.setItem('taskflow-gcal-email', userEmail);
      this.ready = true;
      if (onAuthChangeCallback) onAuthChangeCallback(true);
    },

    gapiLoaded: function() {
      if (typeof gapi === 'undefined' || !API_KEY || API_KEY === 'YOUR_API_KEY') return;
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          gapiInited = true;
          this._checkReady();
        } catch (error) {
          console.warn('Google GAPI init note:', error);
        }
      });
    },

    gisLoaded: function() {
      if (typeof google === 'undefined' || !google.accounts || !CLIENT_ID || CLIENT_ID === 'YOUR_CLIENT_ID') return;
      try {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse) => {
            if (tokenResponse.error !== undefined) {
              throw tokenResponse;
            }
            this._fetchUserInfo(tokenResponse.access_token);
            if (onAuthChangeCallback) onAuthChangeCallback(true);
          },
        });
        gisInited = true;
        this._checkReady();
      } catch (error) {
        console.warn('Google GIS init note:', error);
      }
    },

    _checkReady: function() {
      if ((gapiInited && gisInited) || isDemoMode) {
        this.ready = true;
        if (onAuthChangeCallback && this.isSignedIn()) {
          onAuthChangeCallback(true);
        }
      }
    },

    signIn: function() {
      if (isDemoMode) {
        this.enableDemoMode();
        return;
      }

      if (tokenClient && typeof gapi !== 'undefined' && gapi.client) {
        const token = gapi.client.getToken();
        if (token !== null) {
          tokenClient.requestAccessToken({ prompt: '' });
        } else {
          tokenClient.requestAccessToken({ prompt: 'consent' });
        }
      } else {
        // Enable Demo Mode if keys are missing
        this.enableDemoMode();
      }
    },

    signOut: function() {
      isDemoMode = false;
      userEmail = null;
      localStorage.removeItem('taskflow-gcal-demo');
      localStorage.removeItem('taskflow-gcal-email');
      
      if (typeof gapi !== 'undefined' && gapi.client) {
        const token = gapi.client.getToken();
        if (token && typeof google !== 'undefined' && google.accounts) {
          google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken('');
          });
        }
      }

      if (onAuthChangeCallback) onAuthChangeCallback(false);
    },

    isSignedIn: function() {
      if (isDemoMode) return true;
      if (typeof gapi !== 'undefined' && gapi.client) {
        const token = gapi.client.getToken();
        return !!token;
      }
      return false;
    },

    _fetchUserInfo: async function(accessToken) {
      try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        userEmail = data.email || 'connected@gmail.com';
        localStorage.setItem('taskflow-gcal-email', userEmail);
      } catch (error) {
        userEmail = 'connected.user@gmail.com';
      }
    },

    getUserEmail: function() {
      return userEmail || (isDemoMode ? 'demo.user@gmail.com' : null);
    },

    fetchUpcomingEvents: async function(maxResults = 7) {
      if (isDemoMode || !this.isSignedIn() || typeof gapi === 'undefined' || !gapi.client || !gapi.client.calendar) {
        return this.getDemoEvents();
      }

      try {
        const response = await gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': (new Date()).toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': maxResults,
          'orderBy': 'startTime',
        });
        return response.result.items || [];
      } catch (error) {
        console.warn('Fetch GCal events fallback to Demo mode:', error);
        return this.getDemoEvents();
      }
    },

    fetchEventsForDate: async function(dateStr) {
      if (isDemoMode || !this.isSignedIn() || typeof gapi === 'undefined' || !gapi.client || !gapi.client.calendar) {
        return this.getDemoEventsForDate(dateStr);
      }

      try {
        const startOfDay = new Date(dateStr);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        const response = await gapi.client.calendar.events.list({
          'calendarId': 'primary',
          'timeMin': startOfDay.toISOString(),
          'timeMax': endOfDay.toISOString(),
          'singleEvents': true,
          'orderBy': 'startTime',
        });
        return response.result.items || [];
      } catch (error) {
        return this.getDemoEventsForDate(dateStr);
      }
    },

    getDemoEvents: function() {
      const today = new Date().toISOString().split('T')[0];
      return [
        {
          id: 'demo_evt_1',
          summary: 'Client Project Sprint Review',
          description: 'Weekly demo and progress update with stakeholders',
          start: { dateTime: `${today}T09:30:00Z` },
          end: { dateTime: `${today}T10:30:00Z` }
        },
        {
          id: 'demo_evt_2',
          summary: 'UI/UX Design Sync & Token Review',
          description: 'Review color palettes, glassmorphic tokens, and animations',
          start: { dateTime: `${today}T14:00:00Z` },
          end: { dateTime: `${today}T15:00:00Z` }
        },
        {
          id: 'demo_evt_3',
          summary: 'Frontend Code Refactoring Session',
          description: 'Optimize WebGL canvas, performance, and accessibility',
          start: { dateTime: `${today}T16:30:00Z` },
          end: { dateTime: `${today}T17:30:00Z` }
        }
      ];
    },

    getDemoEventsForDate: function(dateStr) {
      return [
        {
          id: `demo_date_${dateStr}_1`,
          summary: 'Team Standup & Daily Goals',
          description: 'Sync daily task list and priorities',
          start: { dateTime: `${dateStr}T10:00:00Z` },
          end: { dateTime: `${dateStr}T10:30:00Z` }
        },
        {
          id: `demo_date_${dateStr}_2`,
          summary: 'Google Calendar API Integration Review',
          description: 'Test OAuth 2.0 token flow and calendar event import',
          start: { dateTime: `${dateStr}T15:00:00Z` },
          end: { dateTime: `${dateStr}T16:00:00Z` }
        }
      ];
    }
  };

  window.GoogleCalendarAPI = GoogleCalendarAPI;
})();
