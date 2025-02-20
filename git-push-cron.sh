#!/bin/bash

# Configuration avec chemins absolus
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/push_log.txt"
LOCK_FILE="${SCRIPT_DIR}/.push_lock"
CHECKPOINT_FILE="${SCRIPT_DIR}/.push_checkpoint"
GIT_DIR="/home/armel/dev/Recrut/StayBliss/"  # À MODIFIER

# Configuration des plages horaires
EVENING_START=19  # Début première plage: 19h
EVENING_END=00   # Fin première plage: minuit
MORNING_START=7  # Début deuxième plage: 7h
MORNING_END=15   # Fin deuxième plage: 15h
MAX_DURATION=14400  # 4 heures en secondes
TARGET_BRANCH="main"
MAX_RETRIES=3

# Variables pour le suivi du temps
START_TIME=0
ELAPSED_TIME=0

# Configuration de l'environnement
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
cd "$GIT_DIR" || {
    echo "❌ Impossible d'accéder au répertoire Git: $GIT_DIR"
    exit 1
}

# Création du répertoire de logs si nécessaire
mkdir -p "$LOG_DIR"

# Fonction pour le logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Fonction pour vérifier si on est dans une plage horaire autorisée
check_time_window() {
    local current_hour=$(date +%H | sed 's/^0//')  # Supprime le zéro initial
    
    # Plage du soir (19h-00h)
    if [ $current_hour -ge $EVENING_START ] && [ $current_hour -lt $EVENING_END ]; then
        return 0
    fi
    
    # Plage du matin (7h-15h)
    if [ $current_hour -ge $MORNING_START ] && [ $current_hour -lt $MORNING_END ]; then
        return 0
    fi
    
    return 1
}

# Fonction pour afficher la prochaine plage horaire
get_next_window() {
    local current_hour=$(date +%H | sed 's/^0//')
    
    if [ $current_hour -lt $MORNING_START ]; then
        echo "prochaine plage à ${MORNING_START}h"
    elif [ $current_hour -lt $EVENING_START ]; then
        echo "prochaine plage à ${EVENING_START}h"
    else
        echo "prochaine plage demain à ${MORNING_START}h"
    fi
}

# Fonction pour vérifier le temps écoulé
check_elapsed_time() {
    ELAPSED_TIME=$(($(date +%s) - START_TIME))
    if [ $ELAPSED_TIME -ge $MAX_DURATION ]; then
        log "⏰ Durée maximale de 4 heures atteinte"
        return 1
    fi
    return 0
}

# Fonction de nettoyage
cleanup() {
    log "🧹 Nettoyage et libération du verrou..."
    rm -f "$LOCK_FILE"
    kill $(jobs -p) 2>/dev/null
    exit "${1:-0}"
}

# Installation du gestionnaire de signaux
trap 'cleanup 1' SIGHUP SIGINT SIGTERM

# Vérification initiale de la plage horaire
if ! check_time_window; then
    log "⏰ Hors plage horaire autorisée (${EVENING_START}h-${EVENING_END}h et ${MORNING_START}h-${MORNING_END}h) - $(get_next_window)"
    exit 0
fi

# Vérification du verrou
if [ -f "$LOCK_FILE" ]; then
    if pid=$(cat "$LOCK_FILE") && kill -0 "$pid" 2>/dev/null; then
        log "⚠️ Une autre instance est en cours d'exécution (PID: $pid)"
        exit 1
    else
        log "🔄 Nettoyage d'un verrou obsolète"
        rm -f "$LOCK_FILE"
    fi
fi

# Création du verrou
echo $$ > "$LOCK_FILE"

# Initialisation du temps de départ
START_TIME=$(date +%s)

# Fonction de vérification de l'état Git
check_git_state() {
    if ! git fetch --quiet origin "$TARGET_BRANCH"; then
        return 1
    fi
    if ! git diff --quiet HEAD; then
        return 1
    fi
    return 0
}

# Récupération des commits
COMMITS=($(git cherry -v | awk '{print $2}'))

# Gestion du point de reprise
if [ -f "$CHECKPOINT_FILE" ]; then
    LAST_PROCESSED=$(cat "$CHECKPOINT_FILE")
    NEW_COMMITS=()
    FOUND_LAST=false
    for commit in "${COMMITS[@]}"; do
        if [ "$FOUND_LAST" = true ]; then
            NEW_COMMITS+=("$commit")
        elif [ "$commit" = "$LAST_PROCESSED" ]; then
            FOUND_LAST=true
        fi
    done
    COMMITS=("${NEW_COMMITS[@]}")
fi

if [ ${#COMMITS[@]} -eq 0 ]; then
    log "✅ Aucun commit à pousser"
    cleanup 0
fi

log "📦 ${#COMMITS[@]} commits à traiter"

# Fonction pour le push d'un commit
push_commit() {
    local COMMIT=$1
    local BRANCH_NAME="push-temp-$COMMIT"
    local RETRY_COUNT=0
    local SUCCESS=false
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ] && [ "$SUCCESS" = false ]; do
        ((RETRY_COUNT++))
        
        # Vérification du temps et de la plage horaire
        if ! check_time_window; then
            log "⏰ Hors plage horaire - $(get_next_window)"
            return 1
        fi
        
        if ! check_elapsed_time; then
            log "⏰ Durée maximale atteinte - reprise à la prochaine exécution"
            return 1
        fi
        
        if [ $RETRY_COUNT -gt 1 ]; then
            log "🔄 Tentative $RETRY_COUNT/$MAX_RETRIES pour $COMMIT"
            sleep $((RETRY_COUNT * 30))
        fi
        
        # Process de push
        if git checkout -b "$BRANCH_NAME" "$COMMIT" 2>>$LOG_FILE && \
           git push origin "$BRANCH_NAME" 2>>$LOG_FILE && \
           git checkout "$TARGET_BRANCH" 2>>$LOG_FILE && \
           git merge "$BRANCH_NAME" 2>>$LOG_FILE && \
           git push origin "$TARGET_BRANCH" 2>>$LOG_FILE; then
            
            # Nettoyage
            git branch -D "$BRANCH_NAME" 2>/dev/null
            git push origin --delete "$BRANCH_NAME" 2>/dev/null
            
            SUCCESS=true
            echo "$COMMIT" > "$CHECKPOINT_FILE"
            log "✅ Commit $COMMIT poussé avec succès"
            
            # Pause aléatoire entre 15 et 1h
            SLEEP_TIME=$((RANDOM % 2100 + 1500))
            log "⏳ Pause de $SLEEP_TIME secondes"
            sleep $SLEEP_TIME &
            wait
        else
            # Nettoyage en cas d'échec
            git checkout "$TARGET_BRANCH" 2>/dev/null
            git branch -D "$BRANCH_NAME" 2>/dev/null
            git push origin --delete "$BRANCH_NAME" 2>/dev/null
        fi
    done
    
    return $([ "$SUCCESS" = true ])
}

# Traitement des commits
for COMMIT in "${COMMITS[@]}"; do
    if ! push_commit "$COMMIT"; then
        if ! check_time_window || ! check_elapsed_time; then
            log "🔒 Arrêt planifié - reprise au prochain cycle"
            cleanup 0
        else
            log "❌ Échec définitif pour le commit $COMMIT"
            cleanup 1
        fi
    fi
done

log "🎉 Tous les commits ont été traités avec succès"
rm -f "$CHECKPOINT_FILE"
cleanup 0
