#!/bin/bash
set -e

REGION="us-east-1"

PERFIL_ORIGEN="954669981484_analista_devops_ps"
PERFIL_DESTINO="557701608708_AWSAdministratorAccess"

CUENTA_ORIGEN="954669981484"
CUENTA_DESTINO="557701608708"

BUCKET_ORIGEN="export-dynamo-954669981484"
BUCKET_DESTINO="export-dynamo-557701608708"




TABLAS=(
 applications
)

# TABLAS=(
# applications
# astro-stream-state
# awards-stream-state
# bills-sequences
# biometrics-stream-state
# broken-passwords
# collected-stream-state
# conciliation-stream-state
# correspondent-stream-state
# dealers
# emails-to-send
# equipment-seller
# external-wager-stream-state
# file_collected
# file_config_collected
# file_logs
# generic_collected
# generic-services-stream-state
# global-parameters
# global-queries
# hierarchies-stream-state
# hierarchy-parameters
# homologation-code
# keys-recaptcha
# legacy-sellers
# legacy-stream-state
# lotteries-games-stream-state
# lotteries-stream-state
# master-config
# master-export-file
# master-resources
# millonario-stream-state
# mipos-tx
# money-control-stream-state
# notifier-stream-state
# online-games-stream-state
# options-administration
# options-collectors
# options-sellers
# papelery-stream-state
# payment-voucher
# payment-voucher-stream-state
# payments-stream-state
# products-stream-state
# promotional-stream-state
# raffles-stream-state
# recharges-stream-state
# remittances
# remittances-stream-state
# reports-stream-state
# resources-administration
# resources-collectors
# resources-sellers
# roles-administration
# roles-collectors
# roles-sellers
# security-stream-state
# sellers
# sellers-stream-state
# sessions-by-user
# shopping-cart
# transaction-notifier
# transactions
# vulnerability-formats
# wiretransfer-stream-state
# )


habilitar_pitr() {
  local tabla=$1

  echo "⚙️ Habilitando Point-in-Time Recovery para la tabla: $tabla"

  aws dynamodb update-continuous-backups \
    --table-name $tabla \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
    --profile $PERFIL_ORIGEN \
    --region $REGION

  echo "✅ Point-in-Time Recovery habilitado para: $tabla"
}


exportar_tabla() {
  local tabla=$1
  local prefix_export="$tabla"

  echo "🚀 Exportando tabla: $tabla"
  export_arn=$(aws dynamodb export-table-to-point-in-time \
    --table-arn arn:aws:dynamodb:$REGION:$CUENTA_ORIGEN:table/$tabla \
    --s3-bucket $BUCKET_ORIGEN \
    --s3-prefix $prefix_export \
    --export-format DYNAMODB_JSON \
    --profile $PERFIL_ORIGEN \
    --region $REGION \
    --query 'ExportDescription.ExportArn' \
    --output text)

    echo "⏳ Esperando exportación..."
    while true; do
    estado=$(aws dynamodb describe-export \
        --export-arn "$export_arn" \
        --profile $PERFIL_ORIGEN \
        --region $REGION \
        --query 'ExportDescription.ExportStatus' \
        --output text)

    if [ "$estado" == "COMPLETED" ]; then
        echo "✅ Exportación completa para: $tabla"
        break
    elif [ "$estado" == "FAILED" ]; then
        echo "❌ La exportación falló para: $tabla"
        exit 1
    else
        echo "⏳ Exportación en progreso para: $tabla, esperando 30s..."
        sleep 30
    fi
    done
}


copiar_a_destino() {
  local tabla=$1
  local prefix_export="$tabla"
  local prefix_import="$tabla"

  echo "📦 Moviendo datos de $tabla a prefijo de importación en el mismo bucket..."
  aws s3 cp s3://$BUCKET_ORIGEN/$prefix_export/ s3://$BUCKET_DESTINO/$prefix_import/ \
    --recursive \
    --source-region $REGION \
    --region $REGION \
    --profile $PERFIL_DESTINO
  echo "✅ Copia completada para: $tabla"
}


importar_tabla() {
  local tabla=$1
  local prefix_import="$tabla"

  echo "📥 Importando tabla: $tabla"
  import_arn=$(aws dynamodb import-table \
    --s3-bucket-source Bucket=$BUCKET_DESTINO,KeyPrefix=$prefix_import/ \
    --input-format DYNAMODB_JSON \
    --table-name $tabla \
    --profile $PERFIL_DESTINO \
    --region $REGION \
    --query 'ImportTableDescription.ImportArn' \
    --output text)

  echo "⏳ Esperando importación..."
  aws dynamodb wait import-table-completed \
    --import-arn "$import_arn" \
    --profile $PERFIL_DESTINO \
    --region $REGION
  echo "🎉 Importación completada para: $tabla"
}


# === LOOP PRINCIPAL ===
for tabla in "${TABLAS[@]}"; do
  echo "==============================="
  echo "🔄 Procesando tabla: $tabla"
  echo "==============================="

#   habilitar_pitr "$tabla"
#   exportar_tabla "$tabla"
#   copiar_a_destino "$tabla"
  importar_tabla "$tabla"

  echo "✅ Tabla $tabla migrada con éxito."
  echo
done

echo "🏁 ¡Todas las tablas han sido migradas correctamente!"
