# Deployment & Post-Deployment Checklists

## 🚀 PRE-DEPLOYMENT CHECKLIST (48 Hours Before)

### Day 1: Code Quality Verification
- [ ] `npm run lint` → 0 errors (warnings OK)
- [ ] `npm run test` → All tests passing
- [ ] `npm run build` → Success in < 15 seconds
- [ ] `npm run test:coverage` → Review coverage report
- [ ] Check bundle size: `npm run build` then review `dist/stats.html`
  - Target: < 600 KB gzip (we're at 532 KB ✓)
  - If > 550 KB: investigate why

### Day 2: Security & Deployment Prep
- [ ] Review `docs/FINAL_AUDIT_REPORT.md` → Confirm all checkboxes
- [ ] Verify environment variables set in Vercel dashboard:
  - `VITE_ROBOTS_POLICY=index, follow`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_KEY`
  - `VITE_TURNSTILE_SITE_KEY`
- [ ] Test offline mode locally:
  - DevTools → Network → Offline
  - Verify offline.html displays
- [ ] Review `backend/ARCHITECTURE.md` with team
- [ ] Verify Sentry project created and config correct

### Before Clicking Deploy
- [ ] All team members notified of deploy time
- [ ] Rollback plan documented
- [ ] Stakeholders informed (may see brief loading)
- [ ] On-call engineer assigned for next 24h

---

## 📦 DEPLOYMENT DAY CHECKLIST

### 1 Hour Before
- [ ] Final git status clean: `git status` → nothing staged
- [ ] Latest code pulled: `git pull origin main`
- [ ] All changes committed: `git log --oneline -5` → review commits
- [ ] Tests passing: `npm run test`
- [ ] Build successful: `npm run build`

### During Deployment
- [ ] Frontend deployed to Vercel (auto via GitHub)
- [ ] Backend deployed to Railway/Fly.io
- [ ] Environment variables propagated (check dashboards)
- [ ] SSL certificate valid (green lock in browser)

### Immediately After Deploy
- [ ] Visit production site: https://farm-intellect.vercel.app
- [ ] Visual check:
  - [ ] Logo loads correctly
  - [ ] Navigation works
  - [ ] Login page appears
- [ ] Open DevTools → Console
  - [ ] No JavaScript errors (red X)
  - [ ] Service Worker registered (green check)
- [ ] Test critical path:
  - [ ] Can log in with SMS OTP
  - [ ] Can view dashboard
  - [ ] Can load a field map

---

## 🔍 POST-DEPLOYMENT CHECKLIST (First 24 Hours)

### First 15 Minutes
- [ ] Check Sentry dashboard
  - [ ] No error spike
  - [ ] Error rate normal (< 0.1%)
- [ ] Open DevTools → Network tab
  - [ ] Page loads in < 3 sec (3G throttle)
  - [ ] No failed requests (red)
- [ ] Mobile test:
  - [ ] Open on phone/tablet
  - [ ] Responsive layout intact
  - [ ] Touch interactions work

### First Hour
- [ ] Monitor Sentry closely
  - [ ] Watch for new error patterns
  - [ ] Check authentication errors
  - [ ] Monitor API response times
- [ ] Check performance metrics
  - [ ] Largest Contentful Paint (LCP) < 2.5s
  - [ ] Cumulative Layout Shift (CLS) < 0.1
  - [ ] First Input Delay (FID) < 100ms
- [ ] Test offline mode again
  - [ ] DevTools → Network → Offline
  - [ ] Click around app → should still work
  - [ ] Go online → data syncs

### First 4 Hours
- [ ] Review analytics (if connected)
  - [ ] Traffic normal
  - [ ] No unexpected bounce rate
- [ ] Check CDN cache hits (if using)
  - [ ] Static assets cached properly
  - [ ] 95%+ cache hit rate for assets
- [ ] Verify Service Worker
  - [ ] DevTools → Application → Service Workers
  - [ ] Status: ACTIVE
  - [ ] Registration time: < 500ms

### First 24 Hours
- [ ] Monitor error trends in Sentry
  - [ ] No errors escalating
  - [ ] User impact minimal (if errors occur)
- [ ] Check database performance
  - [ ] Query times normal (< 200ms avg)
  - [ ] No connection pool exhaustion
- [ ] Review user feedback
  - [ ] No complaints in Slack/email
  - [ ] Feature working as expected
- [ ] Prepare rollback if needed
  - [ ] Know how to revert (git rollback)
  - [ ] Have backup of previous build

### After 24 Hours
- [ ] Create bundle stats baseline
  - `cp dist/stats.html docs/bundle-stats-v1.0.html`
- [ ] Document any issues encountered
  - [ ] What broke? How was it fixed?
  - [ ] Add to LESSONS_LEARNED.md
- [ ] Update team on stability
  - [ ] Share Sentry dashboard link
  - [ ] Show performance metrics
- [ ] Plan next deployment
  - [ ] Schedule weekly releases? Or on-demand?
  - [ ] Who reviews deployments?

---

## 🚨 IF SOMETHING BREAKS (Emergency Response)

### Immediate (< 5 min)
1. [ ] Check Sentry → What error?
2. [ ] Assess severity → Is it critical?
3. [ ] If < 0.1% users affected → monitor
4. [ ] If > 1% users affected → consider rollback

### Rollback (< 15 min if needed)
```bash
# Frontend rollback (Vercel)
# → Go to Vercel dashboard
# → Deployments tab
# → Find previous successful deployment
# → Click "Redeploy"

# Backend rollback (Railway/Fly.io)
# → Deploy previous git commit:
git revert HEAD --no-edit
git push origin main
# → Backend auto-redeploys
```

### Investigation (30 min)
1. [ ] Check what changed in last commit
2. [ ] Review Sentry stack trace
3. [ ] Identify root cause
4. [ ] Plan fix

### Hotfix (< 1 hour)
```bash
git checkout -b hotfix/issue-name
# Fix the issue
npm run test
npm run build
git push origin hotfix/issue-name
# Create PR, merge, deploy
```

### Post-Incident (24 hours)
- [ ] Document what happened
- [ ] Why it wasn't caught in testing
- [ ] Add test case to prevent recurrence
- [ ] Schedule postmortem

---

## 📊 MONITORING DASHBOARD SETUP

### Sentry
- [ ] Create alert for error rate > 1%
- [ ] Create alert for error spike > 5x normal
- [ ] Create alert for performance degradation > 20%

### Vercel
- [ ] Monitor deployment status
- [ ] Check function runtime
- [ ] Review edge cache hits

### Analytics (if integrated)
- [ ] Track daily active users
- [ ] Monitor feature usage
- [ ] Review error patterns by user segment

---

## 💡 Weekly Post-Deployment Tasks

Every Monday:
```bash
# 1. Check bundle growth
npm run build
# Compare dist/stats.html with baseline

# 2. Review Sentry errors
# Check top 5 errors from past week
# Create issues for high-impact errors

# 3. Run dependency audit
npm audit
npm outdated

# 4. Check coverage trends
npm run test:coverage
# Is it going up or down?

# 5. Monitor performance
# Check Core Web Vitals trends
# Alert if LCP > 3 sec
```

---

## ✅ Success Criteria

**Deployment is successful if:**
- ✅ Site loads in < 3 seconds (3G)
- ✅ No JavaScript errors in console
- ✅ Service Worker registered
- ✅ Error rate < 0.1%
- ✅ Users can complete login flow
- ✅ Offline mode works
- ✅ No new Sentry errors
- ✅ Performance metrics better than previous release

**If any of these fail:**
- [ ] Investigate root cause
- [ ] Deploy hotfix
- [ ] Add test to prevent recurrence

---

## 🔗 Quick Links

| Resource | Purpose | Link |
|----------|---------|------|
| Sentry Dashboard | Error tracking | https://sentry.io/farm-intellect |
| Vercel Dashboard | Deployment status | https://vercel.com/projects |
| GitHub Actions | CI/CD logs | github.com/Samrudh2006/farm-intellect-65/actions |
| Railway Dashboard | Backend status | https://railway.app |

---

## 📞 Escalation Contacts

| Issue | Owner | Response Time |
|-------|-------|----------------|
| Frontend deploy failed | DevOps | 15 min |
| Backend error spike | Backend Lead | 30 min |
| Database performance | DBA | 1 hour |
| Security issue | Security | ASAP |

---

**Last Updated:** Today  
**Next Review:** After first production deployment  
**Owner:** v0 Audit System
