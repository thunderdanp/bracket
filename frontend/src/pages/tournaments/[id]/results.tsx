import {
  Alert,
  Avatar,
  Badge,
  Card,
  Center,
  Flex,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { AiOutlineHourglass } from '@react-icons/all-files/ai/AiOutlineHourglass';
import { IconAlertCircle } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import MatchModal from '@components/modals/match_modal';
import { NoContent } from '@components/no_content/empty_table_info';
import { Time, formatTime } from '@components/utils/datetime';
import { formatMatchInput1, formatMatchInput2 } from '@components/utils/match';
import { TournamentMinimal } from '@components/utils/tournament';
import { Translator } from '@components/utils/types';
import { getTournamentIdFromRouter, responseIsValid } from '@components/utils/util';
import { MatchWithDetails } from '@openapi';
import TournamentLayout from '@pages/tournaments/_tournament_layout';
import { getBaseApiUrl, getCourtsLive, getStagesLive, getTeamLogoUrl } from '@services/adapter';
import { getMatchLookup, getStageItemLookup, stringToColour } from '@services/lookups';

function ScheduleRow({
  data,
  openMatchModal,
  stageItemsLookup,
  matchesLookup,
  tournamentData,
}: {
  data: any;
  openMatchModal: any;
  stageItemsLookup: any;
  matchesLookup: any;
  tournamentData: TournamentMinimal;
}) {
  const { t } = useTranslation();
  const pendingColor = '#888888';
  const winColor = '#2a8f37';
  const drawColor = '#656565';
  const loseColor = '#af4034';

  const hasPendingScores = data.match.pending_score1 != null && data.match.pending_score2 != null;
  const scoresNotCommitted = data.match.stage_item_input1_score === 0 && data.match.stage_item_input2_score === 0;
  const showPending = hasPendingScores && scoresNotCommitted;

  const displayScore1 = showPending ? data.match.pending_score1 : data.match.stage_item_input1_score;
  const displayScore2 = showPending ? data.match.pending_score2 : data.match.stage_item_input2_score;

  const team1_color = showPending
    ? pendingColor
    : displayScore1 > displayScore2
      ? winColor
      : displayScore1 === displayScore2
        ? drawColor
        : loseColor;
  const team2_color = showPending
    ? pendingColor
    : displayScore2 > displayScore1
      ? winColor
      : displayScore1 === displayScore2
        ? drawColor
        : loseColor;

  return (
    <UnstyledButton style={{ width: '100%' }}>
      <Card
        shadow="sm"
        radius="md"
        withBorder
        mt="md"
        pt="0rem"
        onClick={() => {
          openMatchModal(data.match);
        }}
      >
        <Card.Section withBorder>
          <Grid pt="0.75rem" pb="0.5rem">
            <Grid.Col mb="0rem" span={{ base: 6, xs: 4 }}>
              <Text pl="sm" mt="sm" fw={800}>
                {data.match.court.name}
              </Text>
            </Grid.Col>
            <Grid.Col mb="0rem" span={{ base: 6, xs: 4 }}>
              <Center>
                <Text mt="sm" fw={800}>
                  {data.match.start_time != null ? <Time datetime={data.match.start_time} /> : null}
                </Text>
              </Center>
            </Grid.Col>
            <Grid.Col mb="0rem" span={{ base: 12, xs: 4 }}>
              <Flex justify="right" gap="xs" wrap="wrap">
                {data.match.official && (
                  <Badge color="cyan" variant="light" mt="0.8rem" size="md">
                    {data.match.official.name}
                  </Badge>
                )}
                <Badge
                  color={stringToColour(`${data.stageItem.id}`)}
                  variant="outline"
                  mr="md"
                  mt="0.8rem"
                  size="md"
                >
                  {data.stageItem.name}
                </Badge>
              </Flex>
            </Grid.Col>
          </Grid>
        </Card.Section>
        <Stack pt="sm">
          <Grid>
            <Grid.Col span="auto" pb="0rem">
              <Group gap="xs">
                {getTeamLogoUrl(tournamentData.id, data.match.stage_item_input1?.team?.id, data.match.stage_item_input1?.team?.logo_path) && (
                  <Avatar
                    src={getTeamLogoUrl(tournamentData.id, data.match.stage_item_input1?.team?.id, data.match.stage_item_input1?.team?.logo_path)}
                    size="sm"
                    radius="sm"
                  />
                )}
                <Text fw={500}>
                  {formatMatchInput1(t, stageItemsLookup, matchesLookup, data.match)}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span="content" pb="0rem">
              <div
                style={{
                  backgroundColor: team1_color,
                  borderRadius: '0.5rem',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  color: 'white',
                  fontWeight: 800,
                }}
              >
                {displayScore1}
              </div>
            </Grid.Col>
          </Grid>
          <Grid mb="0rem">
            <Grid.Col span="auto" pb="0rem">
              <Group gap="xs">
                {getTeamLogoUrl(tournamentData.id, data.match.stage_item_input2?.team?.id, data.match.stage_item_input2?.team?.logo_path) && (
                  <Avatar
                    src={getTeamLogoUrl(tournamentData.id, data.match.stage_item_input2?.team?.id, data.match.stage_item_input2?.team?.logo_path)}
                    size="sm"
                    radius="sm"
                  />
                )}
                <Text fw={500}>
                  {formatMatchInput2(t, stageItemsLookup, matchesLookup, data.match)}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span="content" pb="0rem">
              <div
                style={{
                  backgroundColor: team2_color,
                  borderRadius: '0.5rem',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  color: 'white',
                  fontWeight: 800,
                }}
              >
                {displayScore2}
              </div>
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>
    </UnstyledButton>
  );
}

function Schedule({
  t,
  stageItemsLookup,
  openMatchModal,
  matchesLookup,
  tournamentData,
}: {
  t: Translator;
  stageItemsLookup: any;
  openMatchModal: CallableFunction;
  matchesLookup: any;
  tournamentData: TournamentMinimal;
}) {
  const matches: any[] = Object.values(matchesLookup);
  const sortedMatches = matches
    .filter((m1: any) => m1.match.start_time != null)
    .sort((m1: any, m2: any) => (m1.match.court?.name > m2.match.court?.name ? 1 : -1))
    .sort((m1: any, m2: any) => (m1.match.start_time > m2.match.start_time ? 1 : -1));

  const rows: React.JSX.Element[] = [];

  for (let c = 0; c < sortedMatches.length; c += 1) {
    const data = sortedMatches[c];

    if (c < 1 || sortedMatches[c - 1].match.start_time) {
      const startTime = formatTime(data.match.start_time);

      if (c < 1 || startTime !== formatTime(sortedMatches[c - 1].match.start_time)) {
        rows.push(
          <Center mt="md" key={`time-${c}`}>
            <Text size="xl" fw={800}>
              {startTime}
            </Text>
          </Center>
        );
      }
    }

    rows.push(
      <ScheduleRow
        key={data.match.id}
        data={data}
        openMatchModal={openMatchModal}
        stageItemsLookup={stageItemsLookup}
        matchesLookup={matchesLookup}
        tournamentData={tournamentData}
      />
    );
  }

  if (rows.length < 1) {
    return (
      <NoContent
        title={t('no_matches_title')}
        description={t('no_matches_description')}
        icon={<AiOutlineHourglass />}
      />
    );
  }

  const noItemsAlert =
    matchesLookup.length < 1 ? (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={t('no_matches_title')}
        color="gray"
        radius="md"
      >
        {t('drop_match_alert_title')}
      </Alert>
    ) : null;

  return (
    <div style={{ width: '100%' }}>
      {rows}
      {noItemsAlert}
    </div>
  );
}

export default function ResultsPage() {
  const [modalOpened, modalSetOpened] = useState(false);
  const [match, setMatch] = useState<MatchWithDetails | null>(null);

  const { t } = useTranslation();
  const { tournamentData } = getTournamentIdFromRouter();
  const swrStagesResponse = getStagesLive(tournamentData.id);
  const swrCourtsResponse = getCourtsLive(tournamentData.id);

  const stageItemsLookup = responseIsValid(swrStagesResponse)
    ? getStageItemLookup(swrStagesResponse)
    : [];
  const matchesLookup = responseIsValid(swrStagesResponse) ? getMatchLookup(swrStagesResponse) : [];

  if (!responseIsValid(swrStagesResponse)) return null;
  if (!responseIsValid(swrCourtsResponse)) return null;

  function openMatchModal(matchToOpen: MatchWithDetails) {
    setMatch(matchToOpen);
    modalSetOpened(true);
  }

  function modalSetOpenedAndUpdateMatch(opened: boolean) {
    if (!opened) {
      setMatch(null);
    }
    modalSetOpened(opened);
  }

  return (
    <TournamentLayout tournament_id={tournamentData.id}>
      <MatchModal
        swrStagesResponse={swrStagesResponse}
        swrUpcomingMatchesResponse={null}
        tournamentData={tournamentData}
        match={match}
        opened={modalOpened}
        setOpened={modalSetOpenedAndUpdateMatch}
        round={null}
      />
      <Title>{t('results_title')}</Title>
      <Center mt="1rem">
        <Group style={{ maxWidth: '48rem', width: '100%' }} px="md">
          <Schedule
            t={t}
            matchesLookup={matchesLookup}
            stageItemsLookup={stageItemsLookup}
            openMatchModal={openMatchModal}
            tournamentData={tournamentData}
          />
        </Group>
      </Center>
    </TournamentLayout>
  );
}
