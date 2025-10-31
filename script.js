// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all tabs and buttons
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));
    
    // Add active class to selected tab and button
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// Forward Factor Calculator
function calculateForwardFactor() {
    // Get input values
    const dte1 = parseFloat(document.getElementById('dte1').value);
    const iv1 = parseFloat(document.getElementById('iv1').value);
    const dte2 = parseFloat(document.getElementById('dte2').value);
    const iv2 = parseFloat(document.getElementById('iv2').value);
    
    // Validation
    if (!dte1 || !iv1 || !dte2 || !iv2) {
        alert('Please fill in all fields');
        return;
    }
    
    if (dte2 <= dte1) {
        alert('Back month DTE must be greater than front month DTE');
        return;
    }
    
    if (iv1 < 0 || iv2 < 0) {
        alert('Implied volatilities must be positive');
        return;
    }
    
    // Convert to years and decimals
    const t1 = dte1 / 365;
    const t2 = dte2 / 365;
    const sigma1 = iv1 / 100;
    const sigma2 = iv2 / 100;
    
    // Calculate variances
    const var1 = Math.pow(sigma1, 2) * t1;
    const var2 = Math.pow(sigma2, 2) * t2;
    
    // Calculate forward variance
    const forwardVar = (var2 - var1) / (t2 - t1);
    
    if (forwardVar < 0) {
        alert('Negative forward variance - check your inputs!');
        return;
    }
    
    // Calculate forward volatility
    const forwardVol = Math.sqrt(forwardVar);
    const forwardVolPercent = forwardVol * 100;
    
    // Calculate forward factor
    const forwardFactor = (sigma1 - forwardVol) / forwardVol;
    const forwardFactorPercent = forwardFactor * 100;
    
    // Display results
    const resultsSection = document.getElementById('forward-results');
    resultsSection.style.display = 'block';
    
    document.getElementById('forward-vol').textContent = forwardVolPercent.toFixed(2) + '%';
    document.getElementById('forward-factor').textContent = forwardFactorPercent.toFixed(2) + '%';
    
    // Determine signal
    let signal = '';
    let signalClass = '';
    let recommendation = '';
    
    if (forwardFactorPercent >= 20) {
        signal = '🟢 STRONG BUY';
        signalClass = 'signal-strong';
        recommendation = `<strong>Strong Setup!</strong> Forward Factor of ${forwardFactorPercent.toFixed(1)}% is well above the 20% threshold. 
        Consider entering a long calendar spread (sell ${dte1}-day, buy ${dte2}-day). 
        The front IV (${iv1}%) is significantly elevated vs forward volatility (${forwardVolPercent.toFixed(1)}%), 
        suggesting a profitable mean reversion opportunity.`;
    } else if (forwardFactorPercent >= 10) {
        signal = '🟡 MODERATE';
        signalClass = 'signal-moderate';
        recommendation = `<strong>Moderate Setup.</strong> Forward Factor of ${forwardFactorPercent.toFixed(1)}% is positive but below the ideal 20% threshold. 
        This could work but has lower edge. Consider waiting for better setups or sizing down.`;
    } else {
        signal = '🔴 NO TRADE';
        signalClass = 'signal-weak';
        recommendation = `<strong>Skip This Trade.</strong> Forward Factor of ${forwardFactorPercent.toFixed(1)}% is too low. 
        The term structure doesn't show enough misalignment to justify the trade. Look for other opportunities.`;
    }
    
    document.getElementById('trade-signal').textContent = signal;
    document.getElementById('trade-signal').className = 'result-value ' + signalClass;
    
    const recommendationDiv = document.getElementById('recommendation');
    recommendationDiv.innerHTML = recommendation;
    recommendationDiv.className = forwardFactorPercent >= 20 ? 'recommendation' : 
                                forwardFactorPercent >= 10 ? 'recommendation warning' : 
                                'recommendation error';
}

// Earnings Calendar Checker
function checkEarningsSetup() {
    // Get all input values
    const ticker = document.getElementById('ticker').value.toUpperCase();
    const volume = parseFloat(document.getElementById('volume').value);
    const frontIV = parseFloat(document.getElementById('front-iv').value);
    const backIV = parseFloat(document.getElementById('back-iv').value);
    const expectedMove = parseFloat(document.getElementById('expected-move').value);
    const historicalMove = parseFloat(document.getElementById('historical-move').value);
    const spreadCost = parseFloat(document.getElementById('spread-cost').value);
    const bidAsk = parseFloat(document.getElementById('bid-ask').value);
    
    // Red flags
    const isBiotech = document.getElementById('is-biotech').checked;
    const isMeme = document.getElementById('is-meme').checked;
    const hasGap = document.getElementById('recent-gap').checked;
    
    // Validation
    if (!ticker || !volume || !frontIV || !backIV || !expectedMove || 
        !historicalMove || !spreadCost || !bidAsk) {
        alert('Please fill in all fields');
        return;
    }
    
    // Calculate ratios
    const ivRatio = frontIV / backIV;
    const moveRatio = expectedMove / historicalMove;
    const bidAskPercent = (bidAsk / spreadCost) * 100;
    
    // Check criteria
    const criteria = [];
    let passCount = 0;
    
    // Volume check
    if (volume >= 1.5) {
        criteria.push({ pass: true, text: `✓ Volume: ${volume}M ≥ 1.5M` });
        passCount++;
    } else {
        criteria.push({ pass: false, text: `✗ Volume: ${volume}M < 1.5M (need more liquidity)` });
    }
    
    // IV ratio check
    if (ivRatio >= 2.5) {
        criteria.push({ pass: true, text: `✓ IV Ratio: ${ivRatio.toFixed(2)}x ≥ 2.5x` });
        passCount++;
    } else {
        criteria.push({ pass: false, text: `✗ IV Ratio: ${ivRatio.toFixed(2)}x < 2.5x (need more skew)` });
    }
    
    // Expected move check
    if (expectedMove <= 10) {
        criteria.push({ pass: true, text: `✓ Expected Move: ${expectedMove}% ≤ 10%` });
        passCount++;
    } else {
        criteria.push({ pass: false, text: `✗ Expected Move: ${expectedMove}% > 10% (too volatile)` });
    }
    
    // Overpricing check
    if (moveRatio >= 3) {
        criteria.push({ pass: true, text: `✓ Overpricing: ${moveRatio.toFixed(1)}x historical ≥ 3x` });
        passCount++;
    } else {
        criteria.push({ pass: false, text: `✗ Overpricing: ${moveRatio.toFixed(1)}x historical < 3x` });
    }
    
    // Bid-ask check
    if (bidAskPercent <= 20) {
        criteria.push({ pass: true, text: `✓ Bid-Ask: ${bidAskPercent.toFixed(1)}% ≤ 20% of cost` });
        passCount++;
    } else {
        criteria.push({ pass: false, text: `✗ Bid-Ask: ${bidAskPercent.toFixed(1)}% > 20% (too wide)` });
    }
    
    // Red flags check
    const hasRedFlags = isBiotech || isMeme || hasGap;
    if (!hasRedFlags) {
        criteria.push({ pass: true, text: `✓ No red flags detected` });
        passCount++;
    } else {
        let flagText = '✗ Red flags: ';
        const flags = [];
        if (isBiotech) flags.push('Biotech');
        if (isMeme) flags.push('Meme stock');
        if (hasGap) flags.push('Recent gap >15%');
        flagText += flags.join(', ');
        criteria.push({ pass: false, text: flagText });
    }
    
    // Display results
    const resultsSection = document.getElementById('earnings-results');
    resultsSection.style.display = 'block';
    
    // Build checklist HTML
    const checklistDiv = document.getElementById('criteria-checklist');
    checklistDiv.innerHTML = criteria.map(item => 
        `<div class="check-item ${item.pass ? 'pass' : 'fail'}">${item.text}</div>`
    ).join('');
    
    // Generate recommendation
    const recommendationDiv = document.getElementById('earnings-recommendation');
    let recommendationText = '';
    let recommendationClass = '';
    
    if (passCount === 6) {
        recommendationText = `<strong>🎯 EXCELLENT SETUP for ${ticker}!</strong><br>
        All criteria met. This is a high-probability earnings calendar trade.<br>
        <br>
        <strong>Execution:</strong><br>
        • Enter today (earnings day) for better liquidity<br>
        • Sell front month call (3-7 DTE post-earnings)<br>
        • Buy back month call (30+ DTE)<br>
        • Risk 3-5% of account maximum<br>
        • Exit 15-30 min after market open tomorrow`;
        recommendationClass = 'recommendation';
    } else if (passCount >= 4) {
        recommendationText = `<strong>⚠️ MARGINAL SETUP for ${ticker}</strong><br>
        ${passCount}/6 criteria met. Consider if the failed criteria are deal-breakers.<br>
        If you proceed, consider sizing down to 2-3% risk.`;
        recommendationClass = 'recommendation warning';
    } else {
        recommendationText = `<strong>❌ SKIP THIS TRADE for ${ticker}</strong><br>
        Only ${passCount}/6 criteria met. Too many red flags for this earnings play.<br>
        Look for better setups with higher IV ratios and no red flags.`;
        recommendationClass = 'recommendation error';
    }
    
    recommendationDiv.innerHTML = recommendationText;
    recommendationDiv.className = recommendationClass;
}

// Add enter key support
document.addEventListener('DOMContentLoaded', function() {
    // Forward factor inputs
    const forwardInputs = ['dte1', 'iv1', 'dte2', 'iv2'];
    forwardInputs.forEach(id => {
        document.getElementById(id)?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateForwardFactor();
            }
        });
    });
    
    // Earnings inputs
    const earningsInputs = ['ticker', 'volume', 'front-iv', 'back-iv', 
                           'expected-move', 'historical-move', 'spread-cost', 'bid-ask'];
    earningsInputs.forEach(id => {
        document.getElementById(id)?.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkEarningsSetup();
            }
        });
    });
});

// Add some custom CSS for signal colors
const style = document.createElement('style');
style.textContent = `
    .signal-strong { color: #16a34a !important; }
    .signal-moderate { color: #ca8a04 !important; }
    .signal-weak { color: #dc2626 !important; }
`;
document.head.appendChild(style);