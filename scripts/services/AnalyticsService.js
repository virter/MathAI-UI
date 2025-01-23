class AnalyticsService {
    constructor() {
        this.apiKey = '231e782cc48cad4947490006ffc6e710';
        this.apiUrl = 'https://api2.amplitude.com/2/httpapi';
    }

    async sendEvent(userId, eventType) {
        const data = {
            api_key: this.apiKey,
            events: [
                {
                    user_id: userId,
                    event_type: eventType
                }
            ]
        };

        let response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': '*/*'
            },
            body: JSON.stringify(data)
        });

        return response;
    }
}