import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzhyjbgelvyewsxaecsi.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aHlqYmdlbHZ5ZXdzeGFlY3NpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ5NTA5NywiZXhwIjoyMDczMDcxMDk3fQ.XfDADB7XHYZhLaVXudo78lTtujeoNzhBw1ch0kmvyPw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
    console.log('Checking user test48h@gmail.com...');

    // 1. Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error('Error listing users:', userError);
        return;
    }

    const user = users.find(u => u.email === 'test48h@gmail.com');

    if (!user) {
        console.log('User test48h@gmail.com not found');
        return;
    }

    console.log('User ID:', user.id);

    // 2. Get profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
    }

    console.log('Profile Data:');
    console.log(JSON.stringify(profile, null, 2));

    // 3. Check trial status
    const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const now = new Date();

    console.log('-----------------------------------');
    console.log('Trial Ends At:', trialEndsAt);
    console.log('Current Time:', now);

    if (trialEndsAt && trialEndsAt > now) {
        console.log('Status: IN TRIAL');
        const diff = trialEndsAt.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        console.log(`Remaining time: ${hours} hours, ${minutes} minutes`);
    } else {
        console.log('Status: TRIAL EXPIRED');
    }
}

checkUser();
