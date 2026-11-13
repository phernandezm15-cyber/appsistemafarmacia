package gt.farmaciadb.nativeapp.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import gt.farmaciadb.nativeapp.hardware.NativeVoiceRecognizer
import java.util.Locale

val SlateBg = Color(0xFF0B1120)
val SlateSurface = Color(0xFF111827)
val SlateCard = Color(0xFF1E293B)
val SlateBorder = Color(0xFF334155)
val EmeraldPrimary = Color(0xFF10B981)
val CyanAccent = Color(0xFF06B6D4)
val AmberWarn = Color(0xFFF59E0B)
val RoseDanger = Color(0xFFEF4444)
val TextMuted = Color(0xFF94A3B8)

private val FarmaciaColorScheme = darkColorScheme(
    primary = EmeraldPrimary,
    onPrimary = Color.White,
    secondary = CyanAccent,
    onSecondary = Color.White,
    background = SlateBg,
    onBackground = Color(0xFFF8FAFC),
    surface = SlateSurface,
    onSurface = Color(0xFFF8FAFC),
    surfaceVariant = SlateCard,
    onSurfaceVariant = TextMuted,
    outline = SlateBorder,
    error = RoseDanger,
    onError = Color.White
)

@Composable
fun FarmaciaNativeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = FarmaciaColorScheme,
        content = content
    )
}

fun formatQ(amount: Double): String = "Q${String.format(Locale.US, "%.2f", amount)}"

@Composable
fun NativeVoiceButton(
    onPartial: (String) -> Unit,
    onFinal: (String) -> Unit,
    onError: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var listening by remember { mutableStateOf(false) }

    val recognizer = remember(context) {
        NativeVoiceRecognizer(
            context = context,
            onPartialText = onPartial,
            onFinalText = onFinal,
            onErrorMsg = onError,
            onListeningChanged = { listening = it }
        )
    }

    DisposableEffect(Unit) {
        onDispose { recognizer.stopListening() }
    }

    val containerColor by animateColorAsState(
        targetValue = if (listening) RoseDanger else EmeraldPrimary,
        label = "voiceBtnColor"
    )

    FilledIconButton(
        onClick = {
            if (listening) recognizer.stopListening() else recognizer.startListening()
        },
        modifier = modifier.size(48.dp),
        shape = RoundedCornerShape(14.dp),
        colors = IconButtonDefaults.filledIconButtonColors(
            containerColor = containerColor,
            contentColor = Color.White
        )
    ) {
        Icon(
            imageVector = if (listening) Icons.Default.Stop else Icons.Default.Mic,
            contentDescription = if (listening) "Detener voz" else "Buscar por voz"
        )
    }
}

@Composable
fun SectionHeader(title: String, subtitle: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.ExtraBold,
            color = Color.White
        )
        Text(
            text = subtitle,
            style = MaterialTheme.typography.bodySmall,
            color = TextMuted
        )
    }
}

@Composable
fun StatusPill(text: String, color: Color) {
    Surface(
        color = color.copy(alpha = 0.16f),
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = text,
            color = color,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}
